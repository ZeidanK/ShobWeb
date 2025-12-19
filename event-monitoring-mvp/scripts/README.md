# Database Scripts

This directory contains utility scripts for database management and seeding.

## Available Scripts

### `seed-database.sh`
Populates the database with default users, sample cameras, and events for development.

**Usage:**
```bash
# Make script executable
chmod +x scripts/seed-database.sh

# Run seeding
./scripts/seed-database.sh
```

**What it creates:**
- Admin user: `admin@example.com` / `password123`
- Operator user: `operator@example.com` / `password123`
- 2 sample cameras (Front Entrance, Parking Lot)
- 2 sample events (Motion Detection, Vehicle Intrusion)

### Quick MongoDB Commands

```bash
# Connect to database
docker exec -it event-monitoring-mongodb mongosh --username admin --password password123 --authenticationDatabase admin

# Check collections
use event_monitoring
show collections
db.users.find().pretty()
db.cameras.find().pretty()
db.events.find().pretty()

# Reset database (DANGER!)
use event_monitoring
db.dropDatabase()
```