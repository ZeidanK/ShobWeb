# Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Backend Won't Start

#### Node.js Version Issues
```bash
# Check current Node.js version
node --version

# Should be v18+ (preferably v20+)
# If using NVM:
nvm install --lts
nvm use --lts
nvm alias default lts/*

# If system Node.js is old:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y
```

#### Port 5000 Already in Use
```bash
# Check what's using port 5000
sudo lsof -i :5000
# OR
netstat -tulpn | grep :5000

# Kill the process
sudo kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

#### Missing Dependencies
```bash
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

### Frontend Won't Start

#### Port 3000 Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process or set different port
REACT_APP_PORT=3001 npm start
```

#### React Dependencies Issues
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

### Database Connection Issues

#### MongoDB Not Running
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable auto-start
sudo systemctl enable mongod

# Check MongoDB logs
sudo journalctl -u mongod --no-pager
```

#### Wrong Database Connection
```bash
# Test MongoDB connection
mongosh

# If that fails, check if MongoDB is listening
sudo netstat -tulpn | grep :27017

# Check MongoDB configuration
sudo cat /etc/mongod.conf
```

#### Permission Issues
```bash
# Fix MongoDB data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
sudo systemctl restart mongod
```

### Login/Authentication Issues

#### Cannot Login with Default Credentials
```bash
# Check if users exist in database
mongosh
use event_monitoring
db.users.find({}, {email: 1, username: 1})

# If no users found, create them
cd /path/to/project
node setup_default_users.js
```

#### Invalid Credentials Error
```bash
# Clear corrupted users and recreate
mongosh
use event_monitoring
db.users.deleteMany({})
exit

# Recreate users
node setup_default_users.js
```

### Environment Variables Issues

#### Missing .env Files
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

#### Wrong API URLs
```bash
# Check backend/.env
MONGODB_URI=mongodb://localhost:27017/event_monitoring

# Check frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Python/AI Service Issues

#### Python Dependencies
```bash
cd ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Python Version Issues
```bash
# Check Python version
python3 --version

# Should be 3.9+
# Install specific version if needed
sudo apt install python3.9 python3.9-venv python3.9-dev
```

### Docker Issues

#### Port Conflicts
```bash
# Stop conflicting services
sudo systemctl stop mongod
sudo systemctl stop nginx
sudo systemctl stop apache2

# Or change ports in docker-compose.yml
```

#### Container Build Errors
```bash
# Clean rebuild
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Performance Issues

#### High CPU Usage
```bash
# Check running processes
top
htop

# Restart services
sudo systemctl restart mongod
# Restart Node.js services
```

#### High Memory Usage
```bash
# Check memory
free -h

# Clear Node.js cache
npm cache clean --force

# Restart services
```

### Network/Firewall Issues

#### Cannot Access from Other Machines
```bash
# Check if ports are bound to localhost only
netstat -tulpn | grep -E ':(3000|5000|27017)'

# Update bind addresses in configuration files
# MongoDB: bind_ip = 0.0.0.0
# Node.js: Listen on 0.0.0.0 instead of localhost
```

#### WSL2 Networking Issues
```bash
# Get WSL2 IP
ip addr show eth0

# Access from Windows using WSL2 IP
# http://<wsl2-ip>:3000
```

## 🆘 Getting Help

If none of these solutions work:

1. **Check logs** for specific error messages
2. **Search error messages** in project issues/documentation  
3. **Restart** your development environment completely
4. **Check versions** of all dependencies
5. **Try clean installation** in a new directory

### Log Locations
```bash
# Backend logs: Console output from npm run dev
# MongoDB logs: sudo journalctl -u mongod
# System logs: sudo journalctl -xe
# Docker logs: docker-compose logs -f
```