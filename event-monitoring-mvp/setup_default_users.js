#!/usr/bin/env node

const http = require('http');

// Web application users only - mobile users authenticate through their own app
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'super_admin',
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
    role: 'operator',
    authMethod: 'email_password',
    profile: {
      firstName: 'John',
      lastName: 'Operator'
    }
  },
  {
    username: 'operator2',
    email: 'operator2@example.com', 
    password: 'password123',
    role: 'operator',
    authMethod: 'email_password',
    profile: {
      firstName: 'Jane',
      lastName: 'Monitor'
    }
  },
  {
    username: 'mobile_admin',
    email: 'mobile@example.com',
    password: 'password123',
    role: 'mobile_admin',
    authMethod: 'email_password',
    profile: {
      firstName: 'Mobile',
      lastName: 'Administrator'
    }
  }
  // Note: Citizens authenticate through mobile app - not stored in web database
];

function makeRequest(user) {
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
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ 
            user: user.username || user.email || user.phone, 
            success: true, 
            data: body 
          });
        } else {
          resolve({ 
            user: user.username || user.email || user.phone, 
            success: false, 
            error: body 
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ 
        user: user.username || user.email || user.phone, 
        success: false, 
        error: err.message 
      });
    });

    req.write(data);
    req.end();
  });
}

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

async function createUsers() {
  console.log('🔍 Checking if backend is running...');
  
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    console.log('❌ Backend not running on http://localhost:5000');
    console.log('💡 Please start the backend first:');
    console.log('   cd backend && npm run dev');
    process.exit(1);
  }

  console.log('✅ Backend is running');
  console.log('👥 Creating default users...\n');

  const results = await Promise.all(users.map(makeRequest));

  results.forEach(result => {
    if (result.success) {
      const userData = JSON.parse(result.data);
      console.log(`✅ Created user: ${result.user} (roles: ${userData.user?.roles?.join(', ') || 'N/A'})`);
    } else {
      const errorMsg = JSON.parse(result.error || '{}').message || result.error;
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log(`ℹ️  User ${result.user} already exists`);
      } else {
        console.log(`❌ Failed to create ${result.user}: ${errorMsg}`);
      }
    }
  });

  console.log('\n🎉 Default users setup complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Super Admin: admin@example.com / password123');
  console.log('   Operator: operator1@example.com / password123');  
  console.log('   Mobile Admin: mobile@example.com / password123');
  console.log('\n📱 Mobile Integration:');
  console.log('   • Citizens authenticate through mobile app (not stored here)');
  console.log('   • Mobile app submits events to /api/mobile/events endpoint');
  console.log('   • Use mobile admin account to manage EventTypes for mobile team');
  console.log('\n🌐 Access:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API: http://localhost:5000/api');
} 

createUsers();