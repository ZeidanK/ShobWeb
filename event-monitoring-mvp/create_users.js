const axios = require('axios');

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    username: 'operator1', 
    email: 'operator1@example.com',
    password: 'password123',
    role: 'operator'
  },
  {
    username: 'operator2',
    email: 'operator2@example.com', 
    password: 'password123',
    role: 'operator'
  }
];

async function createUsers() {
  for (const user of users) {
    try {
      console.log(`Creating user: ${user.username}`);
      const response = await axios.post('http://localhost:5000/api/auth/register', user);
      console.log(`✓ Created ${user.username}`);
    } catch (error) {
      console.log(`✗ Failed to create ${user.username}:`, error.response?.data || error.message);
    }
  }
}

createUsers();