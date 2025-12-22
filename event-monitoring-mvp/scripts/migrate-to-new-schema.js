#!/usr/bin/env node
 
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'event_monitoring';

async function runMigration() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('📊 Starting database migration to new schema...\n');

    // 1. Migrate Users Collection
    console.log('👤 Migrating users...');
    const users = db.collection('users');
    const userDocs = await users.find({}).toArray();
    
    for (const user of userDocs) {
      const updates = {};
      
      // Convert old role field to roles array
      if (user.role && !user.roles) {
        updates.roles = [user.role];
        updates.$unset = { role: 1 };
      }
      
      // Add default authMethod if missing
      if (!user.authMethod) {
        updates.authMethod = user.email ? 'email' : 'phone';
      }
      
      // Add default profile if missing
      if (!user.profile) {
        updates.profile = {
          firstName: user.firstName || user.username || 'User',
          lastName: user.lastName || ''
        };
      }
      
      // Add default permissions based on role
      if (!user.permissions && user.role) {
        updates.permissions = getDefaultPermissions(user.role);
      }
      
      // Add missing boolean fields
      if (user.isEmailVerified === undefined) {
        updates.isEmailVerified = !!user.email;
      }
      if (user.isPhoneVerified === undefined) {
        updates.isPhoneVerified = !!user.phone;
      }
      if (user.isActive === undefined) {
        updates.isActive = true;
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await users.updateOne({ _id: user._id }, { $set: updates, ...(updates.$unset ? { $unset: updates.$unset } : {}) });
        console.log(`  ✅ Updated user: ${user.email || user.username || user.phone}`);
      }
    }
    
    // 2. Create EventTypes Collection
    console.log('\n🏷️  Creating default EventTypes...');
    const eventTypes = db.collection('eventtypes');
    const existingEventTypes = await eventTypes.countDocuments();
    
    if (existingEventTypes === 0) {
      const defaultEventTypes = [
        {
          _id: new ObjectId(),
          name: 'Security Incidents',
          category: 'security',
          description: 'Security-related events and incidents',
          isPublic: true,
          isActive: true,
          order: 1,
          allowedRoles: ['citizen', 'operator', 'admin'],
          fields: [
            { name: 'severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], required: true },
            { name: 'description', type: 'textarea', required: true }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          name: 'Infrastructure Issues',
          category: 'infrastructure',
          description: 'Infrastructure and maintenance issues',
          isPublic: true,
          isActive: true,
          order: 2,
          allowedRoles: ['citizen', 'operator', 'admin'],
          fields: [
            { name: 'urgency', type: 'select', options: ['low', 'medium', 'high'], required: true },
            { name: 'location', type: 'text', required: true }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await eventTypes.insertMany(defaultEventTypes);
      console.log(`  ✅ Created ${defaultEventTypes.length} default EventTypes`);
    }
    
    // 3. Migrate Events Collection
    console.log('\n📅 Migrating events...');
    const events = db.collection('events');
    const eventDocs = await events.find({}).toArray();
    
    // Get EventTypes for mapping
    const eventTypesMap = {};
    const eventTypesList = await eventTypes.find({}).toArray();
    eventTypesList.forEach(et => {
      eventTypesMap[et.name.toLowerCase()] = et._id;
      eventTypesMap[et.category] = et._id;
    });
    
    for (const event of eventDocs) {
      const updates = {};
      
      // Map legacy type field to eventType reference
      if (event.type && !event.eventType) {
        const typeKey = event.type.toLowerCase();
        const mappedEventType = eventTypesMap[typeKey] || eventTypesMap['security incidents'];
        
        if (mappedEventType) {
          updates.eventType = mappedEventType;
          // Cache EventType details for performance
          const eventTypeDoc = eventTypesList.find(et => et._id.equals(mappedEventType));
          if (eventTypeDoc) {
            updates.eventTypeName = eventTypeDoc.name;
            updates.eventTypeCategory = eventTypeDoc.category;
          }
        }
      }
      
      // Add missing fields
      if (!event.isAnonymous) {
        updates.isAnonymous = false;
      }
      
      // Ensure submittedBy exists for non-anonymous events
      if (!event.submittedBy && !event.isAnonymous && event.createdBy) {
        updates.submittedBy = event.createdBy;
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await events.updateOne({ _id: event._id }, { $set: updates });
        console.log(`  ✅ Updated event: ${event._id}`);
      }
    }
    
    // 4. Create Permissions Collection
    console.log('\n🔐 Creating default permissions...');
    const permissions = db.collection('permissions');
    const existingPermissions = await permissions.countDocuments();
    
    if (existingPermissions === 0) {
      const defaultPermissions = [
        { resource: '*', action: '*', description: 'Full system access', createdAt: new Date() },
        { resource: 'events', action: 'read', description: 'View events', createdAt: new Date() },
        { resource: 'events', action: 'create', description: 'Submit events', createdAt: new Date() },
        { resource: 'events', action: 'update', description: 'Update event status', createdAt: new Date() },
        { resource: 'cameras', action: 'read', description: 'View cameras', createdAt: new Date() },
        { resource: 'cameras', action: 'manage', description: 'Manage cameras', createdAt: new Date() },
        { resource: 'event-types', action: 'manage', description: 'Manage event types', createdAt: new Date() },
        { resource: 'users', action: 'read', description: 'View users', createdAt: new Date() },
        { resource: 'users', action: 'manage', description: 'Manage users', createdAt: new Date() }
      ];
      
      await permissions.insertMany(defaultPermissions);
      console.log(`  ✅ Created ${defaultPermissions.length} default permissions`);
    }
    
    // 5. Create Indexes
    console.log('\n📇 Creating indexes...');
    
    // User indexes (enhanced)
    await users.createIndex({ "email": 1 }, { unique: true, sparse: true });
    await users.createIndex({ "phone": 1 }, { unique: true, sparse: true });
    await users.createIndex({ "username": 1 }, { unique: true, sparse: true });
    await users.createIndex({ "roles": 1 });
    
    // EventType indexes
    await eventTypes.createIndex({ "name": 1, "isActive": 1 });
    await eventTypes.createIndex({ "category": 1 });
    
    // Enhanced Event indexes
    await events.createIndex({ "eventType": 1 });
    await events.createIndex({ "submittedBy": 1 });
    await events.createIndex({ "isAnonymous": 1 });
    
    // Permission indexes
    await permissions.createIndex({ "resource": 1, "action": 1 });
    
    console.log('  ✅ Indexes created');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${userDocs.length} migrated`);
    console.log(`   Events: ${eventDocs.length} migrated`);
    console.log(`   EventTypes: ${eventTypesList.length} available`);
    console.log(`   Permissions: ${(await permissions.countDocuments())} available`);
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Test authentication with existing users');
    console.log('   2. Verify events are properly linked to EventTypes');
    console.log('   3. Run: node setup_default_users.js to create test accounts');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

function getDefaultPermissions(role) {
  const rolePermissions = {
    admin: [
      { resource: '*', action: '*', granted: true }
    ],
    super_admin: [
      { resource: '*', action: '*', granted: true }
    ],
    operator: [
      { resource: 'events', action: 'read', granted: true },
      { resource: 'events', action: 'update', granted: true },
      { resource: 'cameras', action: 'read', granted: true },
      { resource: 'cameras', action: 'manage', granted: true }
    ],
    mobile_admin: [
      { resource: 'event-types', action: 'manage', granted: true },
      { resource: 'mobile-users', action: 'read', granted: true },
      { resource: 'events', action: 'read', granted: true }
    ],
    citizen: [
      { resource: 'events', action: 'create', granted: true },
      { resource: 'events', action: 'read', granted: true, conditions: { ownOnly: true } }
    ]
  };
  
  return rolePermissions[role] || rolePermissions.citizen;
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };