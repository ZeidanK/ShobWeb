// MongoDB initialization script
db = db.getSiblingDB('event_monitoring');
 
// Create collections
db.createCollection('users');
db.createCollection('cameras');
db.createCollection('events');
db.createCollection('eventtypes');
db.createCollection('permissions');

// Create indexes
// Users indexes - Web users only (no phone authentication)
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "roles": 1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "lastLoginAt": -1 });

// EventType indexes
db.eventtypes.createIndex({ "name": 1, "isActive": 1 });
db.eventtypes.createIndex({ "category": 1 });
db.eventtypes.createIndex({ "isPublic": 1 });
db.eventtypes.createIndex({ "parentType": 1 });
db.eventtypes.createIndex({ "order": 1 });

// Permission indexes  
db.permissions.createIndex({ "userId": 1 });
db.permissions.createIndex({ "resource": 1 });
db.permissions.createIndex({ "action": 1 });
db.permissions.createIndex({ "userId": 1, "resource": 1, "action": 1 }, { unique: true });

// Cameras indexes
db.cameras.createIndex({ "location": "2dsphere" });
db.cameras.createIndex({ "status": 1 });
db.cameras.createIndex({ "isActive": 1 });
db.cameras.createIndex({ "createdBy": 1 });

// Events indexes - Enhanced for EventType integration
db.events.createIndex({ "cameraId": 1 });
db.events.createIndex({ "eventType": 1 });
db.events.createIndex({ "type": 1 }); // Legacy support
db.events.createIndex({ "severity": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "location": "2dsphere" });
db.events.createIndex({ "createdAt": -1 });
db.events.createIndex({ "assignedTo": 1 });
db.events.createIndex({ "submittedBy": 1 });
db.events.createIndex({ "isAnonymous": 1 });

// Compound indexes
db.events.createIndex({ "status": 1, "createdAt": -1 });
db.events.createIndex({ "eventType": 1, "status": 1 });
db.events.createIndex({ "type": 1, "status": 1 }); // Legacy support
db.events.createIndex({ "cameraId": 1, "createdAt": -1 });
db.events.createIndex({ "submittedBy": 1, "createdAt": -1 });

// Create default permissions
const defaultPermissions = [
  // Admin permissions
  { resource: '*', action: '*', description: 'Full system access' },
  // Operator permissions
  { resource: 'events', action: 'read', description: 'View events' },
  { resource: 'events', action: 'update', description: 'Update event status' },
  { resource: 'cameras', action: 'read', description: 'View cameras' },
  { resource: 'cameras', action: 'manage', description: 'Manage cameras' },
  // Mobile admin permissions
  { resource: 'event-types', action: 'manage', description: 'Manage event types' },
  { resource: 'mobile-users', action: 'read', description: 'View mobile users' },
  // Citizen permissions
  { resource: 'events', action: 'create', description: 'Submit events' },
  { resource: 'events', action: 'read', description: 'View own events', conditions: { ownOnly: true } }
];

db.permissions.insertMany(defaultPermissions.map(p => ({
  ...p,
  createdAt: new Date(),
  updatedAt: new Date()
})));

// Create default EventTypes
const defaultEventTypes = [
  {
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
    ]
  },
  {
    name: 'Theft',
    category: 'security', 
    description: 'Theft and robbery incidents',
    parentType: 'Security Incidents',
    isPublic: true,
    isActive: true,
    order: 1,
    allowedRoles: ['citizen', 'operator', 'admin']
  },
  {
    name: 'Vandalism',
    category: 'security',
    description: 'Property damage and vandalism',
    parentType: 'Security Incidents',
    isPublic: true,
    isActive: true,
    order: 2,
    allowedRoles: ['citizen', 'operator', 'admin']
  },
  {
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
    ]
  },
  {
    name: 'Traffic Issues',
    category: 'traffic',
    description: 'Traffic-related incidents and issues',
    isPublic: true,
    isActive: true,
    order: 3,
    allowedRoles: ['citizen', 'operator', 'admin']
  }
];

db.eventtypes.insertMany(defaultEventTypes.map(et => ({
  ...et,
  createdAt: new Date(),
  updatedAt: new Date()
})));

// Create default admin user with web-only structure
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0HIMU.Gsva", // password123
  roles: ["super_admin"],
  authMethod: "email",
  profile: {
    firstName: "System",
    lastName: "Administrator"
  },
  permissions: [
    { resource: "*", action: "*", granted: true }
  ],
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully with enhanced models!");
print("✅ Collections: users, cameras, events, eventtypes, permissions");
print("✅ Default EventTypes created for mobile team integration");
print("✅ Default permissions created");
print("✅ Web admin user: admin@example.com / password123");
print("📱 Mobile users authenticate through their own app - we only receive events");