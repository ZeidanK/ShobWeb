#!/usr/bin/env node

/**
 * Database Setup and Initialization Script
 * 
 * This script consolidates all database setup tasks:
 * - Creates collections and indexes
 * - Seeds initial EventTypes and permissions  
 * - Creates default web users (operators/admins)
 * 
 * Note: Mobile users authenticate through their own app - not stored here
 */

const http = require('http');
const { MongoClient } = require('mongodb');

// Database connection
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'event_monitoring';

// Default web users (mobile users authenticate separately)
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    roles: ['super_admin'],
    authMethod: 'email',
    profile: {
      firstName: 'System',
      lastName: 'Administrator'
    }
  },
  {
    username: 'operator1', 
    email: 'operator1@example.com',
    password: 'password123',
    roles: ['operator'],
    authMethod: 'email',
    profile: {
      firstName: 'John',
      lastName: 'Operator'
    }
  },
  {
    username: 'mobile_admin',
    email: 'mobile@example.com',
    password: 'password123',
    roles: ['mobile_admin'],
    authMethod: 'email',
    profile: {
      firstName: 'Mobile',
      lastName: 'Administrator'
    }
  }
];

// Default EventTypes for mobile team integration
const defaultEventTypes = [
  {
    name: 'Security Incidents',
    category: 'security',
    description: 'Security-related events and incidents',
    isPublic: true,
    isActive: true,
    order: 1,
    allowedRoles: ['operator', 'admin'],
    fields: [
      { name: 'severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], required: true },
      { name: 'description', type: 'textarea', required: true }
    ]
  },
  {
    name: 'Theft',
    category: 'security', 
    description: 'Theft and robbery incidents',
    parentType: 'Security Incidents',
    isPublic: true,
    isActive: true,
    order: 1
  },
  {
    name: 'Infrastructure Issues',
    category: 'infrastructure',
    description: 'Infrastructure and maintenance issues',
    isPublic: true,
    isActive: true,
    order: 2,
    fields: [
      { name: 'urgency', type: 'select', options: ['low', 'medium', 'high'], required: true }
    ]
  }
];

// Default permissions
const defaultPermissions = [
  { resource: '*', action: '*', description: 'Full system access' },
  { resource: 'events', action: 'read', description: 'View events' },
  { resource: 'events', action: 'update', description: 'Update event status' },
  { resource: 'cameras', action: 'read', description: 'View cameras' },
  { resource: 'cameras', action: 'manage', description: 'Manage cameras' },
  { resource: 'event-types', action: 'manage', description: 'Manage event types' }
]; 

async function initializeDatabase() {
  console.log('🗄️ Initializing MongoDB database...');
  
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);

    // Create collections
    console.log('📂 Creating collections...');
    const collections = ['users', 'cameras', 'events', 'eventtypes', 'permissions'];
    for (const collection of collections) {
      try {
        await db.createCollection(collection);
        console.log(`   ✅ Created ${collection}`);
      } catch (err) {
        if (err.code === 48) { // Collection already exists
          console.log(`   ℹ️  ${collection} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Create indexes
    console.log('🗂️ Creating indexes...');
    
    // Users indexes (web users only)
    await db.collection('users').createIndex({ "email": 1 }, { unique: true });
    await db.collection('users').createIndex({ "username": 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ "isActive": 1 });
    await db.collection('users').createIndex({ "roles": 1 });
    
    // EventType indexes
    await db.collection('eventtypes').createIndex({ "name": 1, "isActive": 1 });
    await db.collection('eventtypes').createIndex({ "category": 1 });
    await db.collection('eventtypes').createIndex({ "isPublic": 1 });
    
    // Events indexes
    await db.collection('events').createIndex({ "eventType": 1 });
    await db.collection('events').createIndex({ "status": 1 });
    await db.collection('events').createIndex({ "createdAt": -1 });
    await db.collection('events').createIndex({ "location": "2dsphere" });
    
    // Permission indexes  
    await db.collection('permissions').createIndex({ "resource": 1, "action": 1 });
    
    console.log('   ✅ Indexes created');

    // Insert default data
    console.log('🌱 Seeding default data...');
    
    // Insert EventTypes
    const eventTypesResult = await db.collection('eventtypes').insertMany(
      defaultEventTypes.map(et => ({
        ...et,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log(`   ✅ Created ${eventTypesResult.insertedCount} EventTypes`);
    
    // Insert permissions
    const permissionsResult = await db.collection('permissions').insertMany(
      defaultPermissions.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    console.log(`   ✅ Created ${permissionsResult.insertedCount} permissions`);

    await client.close();
    console.log('✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function createWebUsers() {
  console.log('\n👥 Creating web application users...');
  
  // Check if backend is running
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    console.log('❌ Backend not running on http://localhost:5000');
    console.log('💡 Please start the backend first: cd backend && npm run dev');
    process.exit(1);
  }

  console.log('✅ Backend is running');
  
  const results = await Promise.all(defaultUsers.map(makeUserRequest));

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Created user: ${result.user}`);
    } else {
      const errorMsg = JSON.parse(result.error || '{}').message || result.error;
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log(`ℹ️  User ${result.user} already exists`);
      } else {
        console.log(`❌ Failed to create ${result.user}: ${errorMsg}`);
      }
    }
  });
}

function makeUserRequest(user) {
  return new Promise((resolve) => {
    const data = JSON.stringify(user);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ 
          user: user.username || user.email, 
          success: res.statusCode >= 200 && res.statusCode < 300, 
          error: res.statusCode >= 400 ? body : null
        });
      });
    });

    req.on('error', (err) => {
      resolve({ user: user.username || user.email, success: false, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => resolve(res.statusCode === 200));
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

async function main() {
  console.log('🚀 Event Monitoring MVP - Database Setup');
  console.log('=====================================\n');
  
  await initializeDatabase();
  await createWebUsers();
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📧 Web Login Credentials:');
  console.log('   Super Admin: admin@example.com / password123');
  console.log('   Operator: operator1@example.com / password123');
  console.log('   Mobile Admin: mobile@example.com / password123');
  console.log('\n📱 Mobile Integration:');
  console.log('   • Mobile users authenticate through their own app');
  console.log('   • EventTypes available at: GET /api/mobile/events/types');
  console.log('   • Mobile events submitted to: POST /api/mobile/events');
  console.log('\n🌐 Access:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API: http://localhost:5000/api');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initializeDatabase, createWebUsers };