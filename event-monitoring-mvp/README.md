# Event Monitoring MVP

A comprehensive security event monitoring system with real-time video analysis, camera management, and interactive dashboards.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ 
- **MongoDB** 6.0+
- **Docker** and Docker Compose (optional)

### Development Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd event-monitoring-mvp
   ```

2. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

3. **Or Manual Setup**
   
   **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

   **AI Service:**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python app.py
   ```

   **MongoDB:**
   ```bash
   mongod --dbpath ./data
   ```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **MongoDB**: localhost:27017

## 🏗️ Architecture Overview

### System Components

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

### Key Features

- **🔐 Authentication**: JWT-based user authentication with role-based access
- **📹 Camera Management**: Add, configure, and monitor security cameras
- **🤖 AI Detection**: YOLOv8-powered real-time object and person detection
- **🗺️ Interactive Map**: Mapbox integration for camera and event visualization
- **📊 Dashboard**: Real-time metrics, charts, and system status
- **🔔 Notifications**: Real-time alerts via WebSocket connections
- **⚙️ Settings**: Comprehensive system configuration and preferences

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