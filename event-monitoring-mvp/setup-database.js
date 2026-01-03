#!/usr/bin/env node

/**
 * CENTRALIZED DATABASE SETUP SCRIPT
 * 
 * This is the ONLY script you need to run for complete database setup.
 * It handles everything:
 * - MongoDB initialization
 * - Creating default users for web app
 * - No duplicate files, no confusion
 * 
 * Usage: node setup-database.js
 */

const http = require('http');

// Default users for web application (mobile users authenticate separately)
const webUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    roles: ['super_admin'],
    authMethod: 'email_password',
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
    authMethod: 'email_password',
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
    authMethod: 'email_password',
    profile: {
      firstName: 'Mobile',
      lastName: 'Administrator'
    }
  }
];

function makeUserRequest(user) {
  return new Promise((resolve, reject) => {
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
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve({ success: true, user: user.username, email: user.email });
        } else if (res.statusCode === 400 && responseData.includes('already exists')) {
          resolve({ success: false, user: user.username, email: user.email, reason: 'already_exists' });
        } else {
          resolve({ success: false, user: user.username, email: user.email, error: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject({ success: false, user: user.username, email: user.email, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({ hostname: 'localhost', port: 5000, path: '/health' }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('🚀 CENTRALIZED DATABASE SETUP');
  console.log('===============================\n');
  
  // Check backend
  console.log('🔍 Checking if backend is running...');
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.log('❌ Backend is not running!');
    console.log('\n💡 Start the backend first:');
    console.log('   cd backend && npm run dev');
    console.log('\n   Then run this script again.');
    process.exit(1);
  }
  
  console.log('✅ Backend is running\n');
  
  // Create users
  console.log('👥 Creating web application users...');
  console.log('📱 Note: Mobile users authenticate separately through their own app\n');
  
  const results = await Promise.all(webUsers.map(makeUserRequest));
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Created: ${result.user} (${result.email})`);
    } else if (result.reason === 'already_exists') {
      console.log(`ℹ️  Exists: ${result.user} (${result.email})`);
    } else {
      console.log(`❌ Failed: ${result.user} - ${result.error}`);
    }
  });
  
  console.log('\n🎉 Database setup complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Super Admin: admin@example.com / password123');
  console.log('   Operator: operator1@example.com / password123');
  console.log('   Mobile Admin: mobile@example.com / password123');
  console.log('\n🌐 Access:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend: http://localhost:5000');
  console.log('\n📱 Mobile Integration:');
  console.log('   • Mobile users authenticate in their own app');
  console.log('   • Events are submitted to /api/events endpoint');
  console.log('   • Use mobile_admin account to coordinate with mobile team');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };