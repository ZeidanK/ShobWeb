# 🚀 Event Monitoring MVP - Daily Commands Reference

## Copy-Paste Quick Start (WSL from project root)

### 1. Start MongoDB
```bash
cd event-monitoring-mvp
docker-compose up -d mongodb
```

### 2. Start Backend
```bash
cd backend && npm run dev
```

### 3. Start Frontend  
```bash
cd frontend && npm start
```

### 4. Login Credentials
- **Email**: admin@example.com
- **Password**: password123

---

## 🗄️ MongoDB Commands

### Connect to MongoDB
```bash
docker exec -it event-monitoring-mongodb mongosh --username admin --password password123 --authenticationDatabase admin
```

### Check Database & Collections
```bash
# Once connected to mongosh:
use event_monitoring
show collections
db.users.find().pretty()
db.cameras.find().pretty() 
db.events.find().pretty()

# Count documents
db.users.countDocuments()
db.cameras.countDocuments()
db.events.countDocuments()
```

### Quick User Check (one-liner)
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