// MongoDB initialization script - CLEAN VERSION
db = db.getSiblingDB('event_monitoring');

// Create essential collections
db.createCollection('users');
db.createCollection('cameras');
db.createCollection('events');

// Essential indexes only
// Users (web app users only)
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "phone": 1 }, { unique: true, sparse: true });

// Cameras
db.cameras.createIndex({ "location.coordinates": "2dsphere" });
db.cameras.createIndex({ "status": 1 });

// Events (enhanced for mobile integration)
db.events.createIndex({ "type": 1 });
db.events.createIndex({ "severity": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "location.coordinates": "2dsphere" });
db.events.createIndex({ "createdAt": -1 });
db.events.createIndex({ "source": 1 });

print("✅ MongoDB initialization complete");