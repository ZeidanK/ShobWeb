# Event Monitoring MVP - Quick Start

## 🚀 Daily Commands (From WSL)

### 1. Navigate to project and start MongoDB
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

### 4. Check Services
```bash
# Check if services are running
docker ps
netstat -tulpn | grep :3000  # Frontend
netstat -tulpn | grep :5000  # Backend
netstat -tulpn | grep :27017 # MongoDB
```

## 🔐 Login
- **Email**: admin@example.com  
- **Password**: password123

## 📍 URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Health: http://localhost:5000/health