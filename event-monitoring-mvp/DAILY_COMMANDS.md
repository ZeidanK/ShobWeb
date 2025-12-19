# 🚀 Event Monitoring MVP - Daily Commands Reference

## Copy-Paste Quick Start (WSL from project root)

### 1. Navigate to Project
```bash
cd /mnt/c/Users/$USER/Documents/event-monitoring-mvp  # Windows Documents
# OR
cd ~/event-monitoring-mvp  # If cloned in Ubuntu home
```

### 2. Start Backend
```bash
cd backend && npm run dev
```

### 3. Start Frontend (in new terminal)
```bash
cd frontend && npm start
```

### 4. Start AI Service (optional, in new terminal)
```bash
cd ai-service && python3 app.py
```

### 5. Login Credentials
- **Email**: admin@example.com
- **Password**: password123

---

## 🔧 Development Commands

### Check Services Status
```bash
# Check running processes
ps aux | grep -E "(node|mongod|python)"

# Check ports
netstat -tulpn | grep -E ":(3000|5000|27017|8000)"

# Check MongoDB status
sudo systemctl status mongod
```

### Install/Update Dependencies
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# AI Service
cd ai-service && pip3 install -r requirements.txt
```

### Quick Restart All Services
```bash
# Stop all Node.js processes
pkill -f node

# Restart MongoDB
sudo systemctl restart mongod

# Start backend & frontend again
cd backend && npm run dev &
cd frontend && npm start &
```

---

## 🗄️ MongoDB Commands

### Connect to MongoDB
```bash
mongosh
```

### Basic Database Operations (in mongosh)
```javascript
// Switch to project database
use event_monitoring

// Show collections
show collections

// View users
db.users.find().pretty()
db.users.find({}, {email: 1, username: 1, role: 1})

// View cameras
db.cameras.find().pretty()

// View events  
db.events.find().pretty()

// Count documents
db.users.countDocuments()
db.cameras.countDocuments()  
db.events.countDocuments()
```

### User Management (in mongosh)
```javascript
// Delete all users
db.users.deleteMany({})

// Delete specific user
db.users.deleteOne({email: "user@example.com"})

// Update user role
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})

// Find user by email
db.users.findOne({email: "admin@example.com"})
```

### Create Default Users (from project root)
```bash
# Make sure backend is running first, then:
node setup_default_users.js
```

---

## 🔍 Debugging Commands

### Backend Logs
```bash
cd backend && npm run dev
# Look for error messages in console output
```

### MongoDB Logs
```bash
# View recent MongoDB logs
sudo journalctl -u mongod --no-pager --lines 50

# Follow MongoDB logs in real-time
sudo journalctl -u mongod -f
```

### Check Application Health
```bash
# Test backend health endpoint
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000

# Test MongoDB connection
mongosh --eval "db.runCommand('ping')"
```

### Kill Stuck Processes
```bash
# Kill all Node.js processes
pkill -f node

# Kill specific ports
sudo lsof -ti:3000 | xargs sudo kill -9
sudo lsof -ti:5000 | xargs sudo kill -9

# Kill Python processes
pkill -f python3
```

---

## 🛠️ Quick Fixes

### Reset Everything
```bash
# Stop all services
pkill -f node
pkill -f python3

# Restart MongoDB
sudo systemctl restart mongod

# Clear users and recreate
mongosh --eval "use event_monitoring; db.users.deleteMany({})"
node setup_default_users.js

# Start services fresh
cd backend && npm run dev &
cd frontend && npm start &
```

### Clean Dependencies
```bash
# Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Clean frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clean AI service
cd ai-service
pip3 install --force-reinstall -r requirements.txt
```
```bash
docker exec -it event-monitoring-mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "use event_monitoring; db.users.find().pretty()"
```

### Create Admin User (if missing)
```bash
docker exec -it event-monitoring-mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "use event_monitoring; db.users.insertOne({username: 'admin', email: 'admin@example.com', password: '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0HIMU.Gsva', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date()})"
```

---

## 🔧 Fix Common Issues

### Node.js version errors (NVM conflicts):
```bash
# If you have NVM (most common solution):
nvm install --lts          # Install latest LTS
nvm use --lts              # Use latest LTS  
nvm alias default lts/*    # Set as permanent default
node --version             # Should be v20+ or v22+

# If npm still has issues:
npm install -g npm@latest
```

### Kill stuck processes:
```bash
pkill -f "ts-node-dev"
pkill -f "react-scripts"
```

### Reset everything:
```bash
docker-compose down
docker-compose up -d mongodb
# Then restart backend & frontend
```

---

## 📍 URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

## 📊 Check Status
```bash
docker ps  # See running containers
netstat -tulpn | grep :3000  # Frontend port
netstat -tulpn | grep :5000  # Backend port  
netstat -tulpn | grep :27017 # MongoDB port
```