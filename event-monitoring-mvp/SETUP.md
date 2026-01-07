# Setup Guide - Event Monitoring MVP

## 🎯 Prerequisites

This guide assumes you're using **Windows with WSL2** (recommended). For other systems, adapt the commands accordingly.

### Step 1: Install WSL2 (Windows Users)

```powershell
# Run in PowerShell as Administrator
wsl --install
```

This installs WSL2 and Ubuntu by default. **Restart your computer** when prompted.

After restart, launch "Ubuntu" from Start menu and create a username/password.

### Step 2: Update Ubuntu

```bash
# In WSL2 Ubuntu terminal
sudo apt update && sudo apt upgrade -y
```

---

## 📦 Install Dependencies

### Step 3: Install Node.js (Latest LTS)

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Restart terminal or reload bash
source ~/.bashrc

# Install latest Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default lts/*

# Verify installation
node --version  # Should show v20.x.x or v22.x.x
npm --version   # Should show 9.x.x or 10.x.x
```

**Common Issue**: If `nvm` command not found, close and reopen your terminal.

### Step 4: Install MongoDB

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

**Should see**: `active (running)` in green.

### Step 5: Install Python & Git

```bash
# Install Python 3.9 and Git
sudo apt install -y python3.9 python3-pip python3.9-venv git

# Verify installations
python3 --version  # Should show Python 3.9.x
git --version      # Should show git version
```

---

## 🏗️ Project Setup

### Step 6: Clone Repository

```bash
# Navigate to your preferred directory
cd ~  # Ubuntu home directory
# OR
cd /mnt/c/Users/$USER/Documents  # Windows Documents folder

# Clone the project
git clone <your-repository-url>
cd event-monitoring-mvp
```

### Step 7: Setup Environment Files

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env

# These files contain default settings that work for local development
# No need to edit them for basic setup
```

### Step 8: Install Project Dependencies

```bash
# Install backend dependencies (Node.js)
cd backend
npm install
cd ..

# Install frontend dependencies (React)
cd frontend
npm install
cd ..

# Install AI service dependencies (Python)
cd ai-service
pip3 install -r requirements.txt
cd ..
```

**This will take a few minutes** - downloads and installs all required packages.

---

## 🚀 First Run

### Step 9: Start the Backend

```bash
# Make sure you're in the project root
cd event-monitoring-mvp

# Start backend in development mode
cd backend && npm run dev
```

**You should see**:
```
🚀 Event Monitoring System Backend Started
📡 Server running on port 5000
🗄️ MongoDB connected successfully
```

**Leave this terminal open** - the backend needs to keep running.

### Step 10: Start the Frontend (New Terminal)

Open a **new WSL2 terminal** and run:

```bash
# Navigate to project
cd ~/event-monitoring-mvp  # OR your project path

# Start frontend
cd frontend && npm start
```

**You should see**:
```
Local:            http://localhost:3000
```

Your **browser should automatically open** to http://localhost:3000

### Step 11: Setup Database and Users

Open a **third WSL2 terminal** and run:

```bash
# Navigate to project root
cd ~/event-monitoring-mvp  # OR your project path

# Complete database setup (creates collections, indexes, EventTypes, and users)
node scripts/setup-database.js
```

**You should see**:
```
🗄️ Initializing MongoDB database...
📂 Creating collections...
🗂️ Creating indexes...
🌱 Seeding default data...
👥 Creating web application users...
✅ Created user: admin
✅ Created user: operator1
✅ Created user: mobile_admin
🎉 Setup complete!
```

## 🗄️ Database Management

All database scripts are in the `scripts/` folder:

```bash
# Complete database setup
node scripts/setup-database.js

# Migrate existing data (if upgrading)
node scripts/migrate-to-new-schema.js

# View all available scripts
ls scripts/
cat scripts/README.md
```

### Step 12: Login to the Application

1. Go to http://localhost:3000 in your browser
2. You should see a login page
3. Login with:
   - **Email**: `admin@example.com`
   - **Password**: `password123`
4. You should see the dashboard

**Success!** 🎉 Your Event Monitoring System is now running.

---

## 🔄 Daily Usage

After initial setup, starting the system is simple:

### Quick Start Commands
```bash
# Terminal 1: Backend
cd ~/event-monitoring-mvp/backend && npm run dev

# Terminal 2: Frontend
cd ~/event-monitoring-mvp/frontend && npm start
```

### Optional: AI Service
```bash
# Terminal 3: AI Service (for object detection)
cd ~/event-monitoring-mvp/ai-service && python3 app.py
```

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

---

## 🆘 Common Issues

### MongoDB Won't Start
```bash
# Check MongoDB status
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod

# Check MongoDB logs for errors
sudo journalctl -u mongod
```

### Node.js Version Issues
```bash
# Check current version
node --version

# If old version, switch to latest
nvm use --lts

# Set as default
nvm alias default lts/*
```

### Port Already in Use
```bash
# Check what's using port 3000 or 5000
sudo lsof -i :3000
sudo lsof -i :5000

# Kill the process if needed
sudo kill -9 <PID>
```

### Can't Login
```bash
# Check if users exist
mongosh
use event_monitoring
db.users.find({}, {email: 1, username: 1})

# If empty, recreate users
exit
node setup_default_users.js
```

### Need to Reset Everything
```bash
# Stop all Node.js processes
pkill -f node

# Restart MongoDB
sudo systemctl restart mongod

# Clear and recreate users
mongosh --eval "use event_monitoring; db.users.deleteMany({})"
node setup_default_users.js

# Restart services
cd backend && npm run dev &
cd frontend && npm start &
```

---

## 📚 Next Steps

- See [DAILY_COMMANDS.md](./DAILY_COMMANDS.md) for copy-paste commands
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed problem solving
- Explore the application features in the dashboard

**Questions?** Check the troubleshooting guide or review the MongoDB commands in the daily commands file.