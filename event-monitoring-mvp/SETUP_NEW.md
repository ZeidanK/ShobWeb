# Event Monitoring MVP - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Using Docker Compose (Easiest)
```bash
# Clone and navigate to project
cd event-monitoring-mvp

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# AI Service: http://localhost:8000
```

Default login credentials:
- **Email**: admin@example.com
- **Password**: password123

## 🛠️ Manual Setup (Development)

### Prerequisites

#### For Windows Users (WSL2 Setup)
**We strongly recommend using WSL2 for the best development experience on Windows:**

1. **Enable WSL2**:
```bash
# Open PowerShell as Administrator and run:
wsl --install
# This will install WSL2 and Ubuntu by default
# Restart your computer when prompted
```

2. **Install Ubuntu 22.04 LTS** (if not automatically installed):
```bash
# In PowerShell:
wsl --install -d Ubuntu-22.04
```

3. **Set up Ubuntu user**:
   - When first launching Ubuntu, create a username and password
   - This will be your Linux user (can be different from Windows)

4. **Update Ubuntu packages**:
```bash
# In WSL2 Ubuntu terminal:
sudo apt update && sudo apt upgrade -y
```

#### General Prerequisites
- **Node.js Latest** and **npm Latest** (CRITICAL: Latest version required for best performance and features)
- **Python 3.9+**
- **MongoDB 6.0+**
- **Git**

### 1. Node.js Latest Setup (WSL2 - REQUIRED)

⚠️ **CRITICAL**: The application requires the latest Node.js for best performance and modern JavaScript features. **If you have NVM installed, it will override system Node.js installations.**

```bash
# 1. Update package lists
sudo apt update && sudo apt upgrade -y

# 2. Check if NVM is installed and active
nvm --version 2>/dev/null && echo "NVM is installed" || echo "NVM not found"
node --version  # Check current Node.js version

# 3. If NVM is installed (RECOMMENDED PATH):
nvm install --lts          # Install latest LTS version  
nvm use --lts              # Switch to latest LTS
nvm alias default lts/*    # Set as default
node --version             # Verify version (should be v20+ or v22+)
npm --version              # Verify npm works

# 4. If you prefer system Node.js (without NVM):
# WARNING: This removes NVM completely
export NVM_DIR=""
unset NVM_DIR NVM_CD_FLAGS NVM_BIN NVM_INC
export PATH=$(echo $PATH | sed 's/:\/root\/.nvm\/versions\/node\/[^:]*\/bin//g')
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt remove --purge nodejs npm libnode* -y
sudo apt autoremove -y
sudo apt install nodejs -y
```

**If you encounter Node.js/npm version conflicts:**
```bash
# Most common issue: NVM overriding system Node.js
nvm current                # Check what NVM is using
which node                 # Should show NVM path if NVM is active

# Solution: Use NVM to install latest version
nvm install --lts          # Install latest LTS
nvm use --lts              # Use latest LTS  
nvm alias default lts/*    # Set as permanent default
node --version             # Should show v20+ or v22+

# If npm still shows errors after Node.js update:
npm install -g npm@latest  # Update npm to latest compatible version

# Alternative: Remove NVM completely (if you prefer system Node.js)
rm -rf ~/.nvm
# Remove NVM lines from ~/.bashrc or ~/.zshrc
# Then install system Node.js as shown above
```

### 2. MongoDB Setup

#### Option A: Install MongoDB on WSL2 (Recommended for Windows)

```bash
# 1. Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# 2. Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Update package list
sudo apt update

# 4. Install MongoDB
sudo apt install -y mongodb-org

# 5. Create MongoDB data directory
sudo mkdir -p /data/db
sudo chown -R $USER:$USER /data/db

# 6. Start MongoDB manually (WSL2 doesn't use systemd by default)
mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log
```

#### Option B: Install MongoDB on Ubuntu/Linux

```bash
# For Ubuntu 22.04
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option C: MongoDB with Docker (Alternative)

```bash
# Run MongoDB in a container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Verify it's running
docker ps | grep mongodb
```

#### Verify MongoDB Installation

```bash
# Test MongoDB connection
mongosh --eval "db.runCommand('ping')"

# Should return: { ok: 1 }
```

### 2. Node.js Setup

#### Install Node.js 18+ using NVM (Recommended)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your terminal or run:
source ~/.bashrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node -v    # Should show v18.x.x
npm -v     # Should show 9.x.x or higher
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env file if needed (default values work for local development)

# Initialize database with admin user
mongosh event_monitoring < ../docker/mongo-init.js

# Start development server
npm run dev
```

**Backend will run on: http://localhost:5000**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env if you want to add Mapbox token for map functionality

# Start development server
npm start
```

**Frontend will run on: http://localhost:3000**

### 5. AI Service Setup (Optional)

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On WSL2/Linux:
source venv/bin/activate
# On Windows Command Prompt:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment setup
cp .env.example .env

# Start service
python app.py
```

**AI Service will run on: http://localhost:8000**

## 🔧 Troubleshooting

### Common Issues and Solutions

#### MongoDB Issues

**Problem**: MongoDB fails to start on WSL2
```bash
# Solution: Start MongoDB manually
mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log

# Check if it's running
ps aux | grep mongod
```

**Problem**: Permission denied when accessing MongoDB
```bash
# Solution: Fix permissions
sudo chown -R $USER:$USER /data/db
sudo chmod -R 755 /data/db
```

#### Node.js Issues

**Problem**: npm version incompatible with Node.js
```bash
# Solution: Update to compatible Node.js version
nvm install 18
nvm use 18

# Or update npm
npm install -g npm@latest
```

**Problem**: Port already in use
```bash
# Find process using port 5000
netstat -tulpn | grep 5000
# Or on WSL2:
lsof -i :5000

# Kill the process
kill -9 <process_id>
```

#### WSL2 Specific Issues

**Problem**: Can't access localhost from Windows browser
- **Solution**: Use `localhost` or `127.0.0.1` instead of WSL2 IP
- WSL2 automatically forwards ports to Windows

**Problem**: File permissions issues
```bash
# Solution: Set proper permissions
chmod +x startup-scripts.sh
sudo chown -R $USER:$USER /path/to/project
```

**Problem**: MongoDB data persistence
```bash
# Solution: Always use absolute paths for data directories
mongod --dbpath /home/$USER/mongodb-data
```

### Environment Configuration

#### Backend (.env)
```bash
# Required variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_monitoring
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Optional
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```bash
# Required variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Optional map configuration
REACT_APP_MAPBOX_TOKEN=your-mapbox-access-token-here
REACT_APP_DEFAULT_MAP_CENTER_LAT=40.7128
REACT_APP_DEFAULT_MAP_CENTER_LNG=-74.0060
REACT_APP_DEFAULT_MAP_ZOOM=10
```

## 📚 Development Workflow

### 1. Daily Development Setup
```bash
# Start MongoDB (if not using Docker)
mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log

# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: AI Service (optional)
cd ai-service && source venv/bin/activate && python app.py
```

### 2. Testing the Setup

#### Verify Backend
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### Verify Frontend
- Open browser: http://localhost:3000
- Should see login page
- Try logging in with: admin@example.com / password123

#### Verify Database
```bash
mongosh event_monitoring --eval "db.users.findOne()"
# Should return the admin user document
```

### 3. Team Development Guidelines

#### Before Starting Work
1. Pull latest changes: `git pull origin main`
2. Start all services (MongoDB, backend, frontend)
3. Verify everything works with test login

#### WSL2 Best Practices
- Always work within WSL2 Ubuntu terminal
- Use VS Code with WSL extension for seamless editing
- Store project files in WSL2 filesystem for better performance
- Access files via `\\wsl$\Ubuntu\home\username\projects`

#### Environment Variables
- **Never commit .env files** - they contain secrets
- Always copy from .env.example when setting up
- Ask team lead for production values if needed

## 🐛 Known Issues

1. **WSL2 Clock Sync**: Sometimes WSL2 clock gets out of sync
   ```bash
   # Fix by running:
   sudo hwclock -s
   ```

2. **MongoDB on Windows**: Native MongoDB on Windows can be tricky
   - Recommend using WSL2 + MongoDB in Linux environment
   - Or use Docker for MongoDB

3. **File Watching**: Sometimes file changes aren't detected
   ```bash
   # In package.json, use polling for file watcher
   "scripts": {
     "dev": "nodemon --legacy-watch src/app.ts"
   }
   ```

## 🚀 Production Deployment

**Note**: This setup is for development only. For production:

1. Use proper MongoDB hosting (MongoDB Atlas, etc.)
2. Set strong JWT secrets
3. Configure proper CORS origins
4. Use environment-specific configuration
5. Enable HTTPS
6. Set up proper logging and monitoring

## 📞 Getting Help

1. **Check logs**: Always check terminal outputs for error messages
2. **Database issues**: Use `mongosh` to verify database state
3. **Network issues**: Check if all ports are accessible
4. **WSL2 issues**: Restart WSL2: `wsl --shutdown` then reopen terminal

For team-specific issues, contact the project maintainer.

## 📋 Quick Reference

### Essential Commands
```bash
# Start MongoDB
mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log

# Check MongoDB status
ps aux | grep mongod

# Test API
curl http://localhost:5000/api/health

# Update Node.js version
nvm install 18 && nvm use 18

# Reset project
git pull origin main
npm install
cp .env.example .env
```

### Default Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- AI Service: http://localhost:8000
- MongoDB: mongodb://localhost:27017

### Default Credentials
- Email: admin@example.com
- Password: password123
- Role: admin