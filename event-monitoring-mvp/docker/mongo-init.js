// MongoDB initialization script
db = db.getSiblingDB('event_monitoring');

// Create collections
db.createCollection('users');
db.createCollection('cameras');
db.createCollection('events');

// Create indexes
// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1 });

// Cameras indexes
db.cameras.createIndex({ "location": "2dsphere" });
db.cameras.createIndex({ "status": 1 });
db.cameras.createIndex({ "isActive": 1 });
db.cameras.createIndex({ "createdBy": 1 });

// Events indexes
db.events.createIndex({ "cameraId": 1 });
db.events.createIndex({ "type": 1 });
db.events.createIndex({ "severity": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "location": "2dsphere" });
db.events.createIndex({ "createdAt": -1 });
db.events.createIndex({ "assignedTo": 1 });

// Compound indexes
db.events.createIndex({ "status": 1, "createdAt": -1 });
db.events.createIndex({ "type": 1, "status": 1 });
db.events.createIndex({ "cameraId": 1, "createdAt": -1 });

// Create default admin user
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0HIMU.Gsva", // password123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");