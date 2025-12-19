#!/bin/bash

# Event Monitoring MVP - Database Seed Script
# This script creates default data for development and testing

echo "🌱 Starting database seeding process..."

# Check if MongoDB container is running
if ! docker ps | grep -q event-monitoring-mongodb; then
    echo "❌ MongoDB container is not running. Starting it..."
    docker-compose up -d mongodb
    echo "⏳ Waiting for MongoDB to start..."
    sleep 10
fi

# MongoDB connection details
MONGO_USER="admin"
MONGO_PASS="password123"
MONGO_AUTH_DB="admin"
MONGO_DB="event_monitoring"
CONTAINER_NAME="event-monitoring-mongodb"

echo "🔌 Testing MongoDB connection..."
if ! docker exec $CONTAINER_NAME mongosh --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $MONGO_AUTH_DB --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    echo "❌ Failed to connect to MongoDB. Check container status."
    exit 1
fi

echo "✅ MongoDB connection successful"

# Function to execute MongoDB commands
mongo_exec() {
    docker exec $CONTAINER_NAME mongosh --username $MONGO_USER --password $MONGO_PASS --authenticationDatabase $MONGO_AUTH_DB --eval "use $MONGO_DB; $1"
}

echo "🗑️  Cleaning existing data..."
mongo_exec "db.users.deleteMany({}); db.cameras.deleteMany({}); db.events.deleteMany({}); db.aidetections.deleteMany({});"

echo "👤 Creating default admin user..."
mongo_exec "db.users.insertOne({
    username: 'admin',
    email: 'admin@example.com',
    password: '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0HIMU.Gsva',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});"

echo "👥 Creating operator user..."
mongo_exec "db.users.insertOne({
    username: 'operator',
    email: 'operator@example.com',
    password: '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0HIMU.Gsva',
    role: 'operator',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
});"

echo "📹 Creating sample cameras..."
mongo_exec "db.cameras.insertMany([
    {
        name: 'Front Entrance',
        description: 'Main building entrance camera',
        location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
        },
        address: '123 Main St, New York, NY',
        rtspUrl: 'rtsp://camera1.example.com:554/stream',
        resolution: '1920x1080',
        fps: 30,
        status: 'active',
        isActive: true,
        createdBy: ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Parking Lot',
        description: 'Employee parking area surveillance',
        location: {
            type: 'Point',
            coordinates: [-74.007, 40.7130]
        },
        address: '123 Main St Parking, New York, NY',
        rtspUrl: 'rtsp://camera2.example.com:554/stream',
        resolution: '1280x720',
        fps: 25,
        status: 'active',
        isActive: true,
        createdBy: ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);"

echo "🚨 Creating sample events..."
mongo_exec "db.events.insertMany([
    {
        title: 'Motion Detected - Front Entrance',
        description: 'Unusual motion detected at main entrance during off hours',
        type: 'motion_detection',
        severity: 'medium',
        status: 'active',
        location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
        },
        cameraId: ObjectId(),
        detectedObjects: ['person'],
        confidence: 0.85,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000)
    },
    {
        title: 'Vehicle Intrusion Alert',
        description: 'Unauthorized vehicle detected in restricted area',
        type: 'intrusion',
        severity: 'high',
        status: 'investigating',
        location: {
            type: 'Point',
            coordinates: [-74.007, 40.7130]
        },
        cameraId: ObjectId(),
        detectedObjects: ['car'],
        confidence: 0.92,
        assignedTo: ObjectId(),
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(Date.now() - 1800000)
    }
]);"

echo "🔍 Verifying seed data..."
USER_COUNT=$(mongo_exec "db.users.countDocuments()" | tail -n1)
CAMERA_COUNT=$(mongo_exec "db.cameras.countDocuments()" | tail -n1)
EVENT_COUNT=$(mongo_exec "db.events.countDocuments()" | tail -n1)

echo "📊 Seed Summary:"
echo "   👥 Users created: $USER_COUNT"
echo "   📹 Cameras created: $CAMERA_COUNT"
echo "   🚨 Events created: $EVENT_COUNT"

echo ""
echo "🔐 Default Login Credentials:"
echo "   📧 Admin: admin@example.com / password123"
echo "   👤 Operator: operator@example.com / password123"

echo ""
echo "✅ Database seeding completed successfully!"
echo "🚀 You can now start the application and login with the credentials above."