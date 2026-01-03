# Database Scripts

This directory contains all database management scripts for the Event Monitoring MVP.
 
## 🚀 Quick Setup

```bash
# Complete database setup (recommended)
node scripts/setup-database.js
```

This single script handles:
- ✅ Database initialization and indexes
- ✅ Default EventTypes for mobile integration
- ✅ Default permissions
- ✅ Web application users (operators/admins)

**Note**: Mobile users authenticate through their own app - not stored in this database.

## 📋 Available Scripts

### `setup-database.js` (Main Script)
**Purpose**: Complete database setup and user creation  
**When to use**: Initial setup or reset

```bash
# Prerequisites: Backend must be running
cd backend && npm run dev

# In another terminal:
node scripts/setup-database.js
```

**What it creates**:
- Collections: `users`, `cameras`, `events`, `eventtypes`, `permissions`
- Indexes for optimal performance
- Default EventTypes for mobile team
- Web users: admin, operator1, mobile_admin

### `migrate-to-new-schema.js`
**Purpose**: Migrate existing data to new schema  
**When to use**: Upgrading from old version

```bash
node scripts/migrate-to-new-schema.js
```

## 🗂️ Manual Database Operations

### Connect to MongoDB
```bash
# Local MongoDB
mongosh mongodb://localhost:27017/event_monitoring

# Docker MongoDB (if using docker-compose)
docker exec -it mongodb mongosh -u admin -p password123
```

### Check Data
```javascript
// Switch to database
use event_monitoring

// View collections
show collections

// Check users
db.users.find().pretty()

// Check EventTypes
db.eventtypes.find().pretty()

// Check recent events
db.events.find().sort({createdAt: -1}).limit(5).pretty()
```

### Reset Database (⚠️ DANGER)
```javascript
// This will delete ALL data!
use event_monitoring
db.dropDatabase()
```

## 🔧 Troubleshooting

### "Backend not running" error
```bash
# Start backend first
cd backend
npm run dev

# Wait for "Server running on port 5000"
# Then run database setup
node scripts/setup-database.js
```

### "User already exists" warnings
This is normal - the script detects existing users and skips them.

### MongoDB connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Check if port 27017 is in use
sudo netstat -tlnp | grep :27017
```

## 📱 Mobile Team Integration

The database setup creates EventTypes that mobile team can use:

```bash
# Get available EventTypes for mobile app
curl http://localhost:5000/api/mobile/events/types

# Mobile admin can manage EventTypes via:
# POST /api/event-types (create)
# PUT /api/event-types/:id (update) 
# GET /api/event-types (list)
```

## 🏗️ Database Schema Overview

```
event_monitoring/
├── users/          # Web app users (operators, admins)
├── cameras/        # Security cameras
├── events/         # Events from mobile + cameras
├── eventtypes/     # Dynamic event categories
└── permissions/    # Granular access control
```

**Mobile Integration**: 
- Mobile users authenticate in their own app
- Mobile app gets EventTypes from `/api/mobile/events/types`
- Mobile app submits events to `/api/mobile/events`
- Your system only stores the events, not mobile user credentials