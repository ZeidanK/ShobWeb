# Event Monitoring MVP

A comprehensive security event monitoring system with real-time video analysis, camera management, and interactive dashboards.

## 🚀 Getting Started

### New to this project? → **[SETUP.md](./SETUP.md)** 📖

**Quick Setup (experienced users):**

### 1. Install Prerequisites
```bash
# Install WSL2 (PowerShell as Administrator)
wsl --install

# In WSL2, install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install --lts && nvm use --lts && nvm alias default lts/*

# Install MongoDB
sudo apt update && sudo apt upgrade -y
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# Install Python & Git
sudo apt install -y python3.9 python3-pip git
```

### 2. Setup Project
```bash
# Clone and setup
git clone <your-repository-url>
cd event-monitoring-mvp
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ai-service && pip3 install -r requirements.txt && cd ..
```

### 3. Start Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Create default users
node setup_default_users.js
```

### 4. Login
- **Frontend**: http://localhost:3000
- **Email**: admin@example.com
- **Password**: password123

## 🛠️ What's This Project?

A full-stack security monitoring system with:

- **🔐 Authentication**: JWT-based user management
- **📹 Camera Management**: Add and monitor security cameras  
- **🤖 AI Detection**: YOLOv8-powered object/person detection
- **🗺️ Interactive Map**: Mapbox visualization of cameras/events
- **📊 Dashboard**: Real-time metrics and system status
- **🔔 Real-time Alerts**: WebSocket notifications

## 📁 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend│    │  Python AI      │
│   (Port 3000)   │───►│   (Port 5000)   │───►│  (Port 8000)    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • YOLOv8        │
│ • Map View      │    │ • WebSocket     │    │ • OpenCV        │
│ • Auth & Users  │    │ • JWT Auth      │    │ • Real-time     │
│ • Camera Mgmt   │    │ • MongoDB ODM   │    │   Detection     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Port 27017)  │
                    │                 │
                    │ • Users         │
                    │ • Cameras       │
                    │ • Events        │
                    │ • Logs          │
                    └─────────────────┘
```

## 📁 Project Structure

```
event-monitoring-mvp/
├── README.md                 # This file
├── docker-compose.yml        # Docker orchestration
├── SETUP.md                 # Detailed setup instructions
│
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── store/          # Redux state management
│   │   ├── services/       # API client services
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── README.md           # Frontend-specific documentation
│
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers and business logic
│   │   ├── models/         # MongoDB data models
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Authentication and validation
│   │   ├── services/       # External service integrations
│   │   └── utils/          # Utility functions
│   └── README.md           # Backend-specific documentation
│
├── ai-service/             # Python AI/ML service
│   ├── src/
│   │   ├── models/         # AI model implementations
│   │   ├── services/       # Core AI processing services
│   │   └── utils/          # AI utility functions
│   ├── models/             # Pre-trained model files
│   └── README.md           # AI service documentation
│
└── docker/                 # Docker configuration files
    └── mongo-init.js       # MongoDB initialization script
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **Redux Toolkit** for state management
- **React Query** for API state management
- **React Router** for navigation
- **Mapbox GL** for interactive maps

### Backend
- **Node.js 18+** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing

### AI Service
- **Python 3.9+** with FastAPI
- **YOLOv8** for object detection
- **OpenCV** for video processing
- **NumPy** for numerical computing
- **Pillow** for image processing

### DevOps
- **Docker** and Docker Compose
- **MongoDB 6.0+**
- **Nginx** (production)
docker-compose up -d
```

## MVP Features

- ✅ User authentication (JWT-based)
- ✅ Live video streaming from IP cameras
- ✅ AI-powered object detection (people/vehicles)
- ✅ Automatic event creation and management
- ✅ Interactive map with camera locations
- ✅ Real-time event visualization
- ✅ Basic event filtering and details

## Tech Stack

- **Frontend**: React, TypeScript, Mapbox/Google Maps, Material-UI
- **Backend**: Node.js, Express, TypeScript, MongoDB, JWT
- **AI Service**: Python, OpenCV, TensorFlow/PyTorch, FastAPI
- **Database**: MongoDB
- **Deployment**: Docker, Docker Compose

## Project Structure

```
├── backend/          # Node.js API server
├── frontend/         # React web application
├── ai-service/       # Python AI analytics service
├── docker/           # Docker configurations
├── docs/             # Documentation
└── docker-compose.yml
```

## Future Enhancements

- Multiple AI models (face recognition, license plates)
- Advanced event lifecycle management
- SMS/Email notifications
- Comprehensive reporting and analytics
- Geofencing capabilities
- CAD system integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details