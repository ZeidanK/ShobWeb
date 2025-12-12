# 🛡️ Event Monitoring MVP - Complete Security System

<div align="center">
  <h3>Modern AI-Powered Security Monitoring Platform</h3>
  <p><em>A comprehensive security system that combines real-time video monitoring, AI object detection, and intelligent event management</em></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://python.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
</div>

---

## 📋 What This System Does

This Event Monitoring MVP is a **complete security monitoring solution** that automatically watches security cameras using artificial intelligence. Think of it as a smart security guard that never sleeps, never gets distracted, and can watch dozens of cameras simultaneously.

### 🎯 **Core Capabilities**
- **🔍 AI Object Detection** - Automatically detects people, vehicles, and objects in real-time
- **📹 Multi-Camera Management** - Monitor unlimited security cameras from one dashboard
- **🚨 Intelligent Alerts** - Smart notifications that reduce false alarms
- **🗺️ Interactive Mapping** - Visual map showing camera locations and live events
- **👥 User Management** - Role-based access for administrators, managers, and security guards
- **📊 Analytics Dashboard** - Comprehensive insights and reporting
- **📱 Real-time Updates** - Live event streaming via WebSocket connections

---

## 🏗️ Project Structure (For New Developers)

```
cityshob/                                    # 🏠 Main project folder
├── 📁 event-monitoring-mvp/                 # 🚀 The actual application code
│   ├── 📁 frontend/                         # 🎨 User interface (what users see)
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/               # 🧩 Reusable UI components
│   │   │   │   ├── Layout/                  # 📐 Main page layout structure
│   │   │   │   └── ... (other UI components)
│   │   │   ├── 📁 pages/                    # 📄 Main application pages
│   │   │   │   ├── Dashboard.tsx            # 🏠 Main overview page
│   │   │   │   ├── Events.tsx               # 🚨 Security events list
│   │   │   │   ├── Cameras.tsx              # 📹 Camera management
│   │   │   │   ├── MapView.tsx              # 🗺️ Interactive map
│   │   │   │   └── ... (other pages)
│   │   │   ├── 📁 services/                 # 🔌 API communication code
│   │   │   ├── 📁 store/                    # 🗃️ Application state management
│   │   │   └── 📁 types/                    # 📝 TypeScript type definitions
│   │   ├── package.json                     # 📦 Frontend dependencies list
│   │   └── Dockerfile                       # 🐳 Frontend container config
│   │
│   ├── 📁 backend/                          # 🖥️ Server (business logic & database)
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/              # 🎮 Request handling logic
│   │   │   │   ├── authController.ts        # 🔐 User authentication
│   │   │   │   ├── cameraController.ts      # 📹 Camera management
│   │   │   │   ├── eventController.ts       # 🚨 Event handling
│   │   │   │   └── userController.ts        # 👥 User management
│   │   │   ├── 📁 routes/                   # 🛣️ API endpoint definitions
│   │   │   ├── 📁 models/                   # 📊 Database schemas
│   │   │   ├── 📁 middleware/               # ⚙️ Request processing middleware
│   │   │   └── 📁 services/                 # 🔧 Business logic services
│   │   ├── package.json                     # 📦 Backend dependencies list
│   │   └── Dockerfile                       # 🐳 Backend container config
│   │
│   ├── 📁 ai-service/                       # 🤖 Artificial Intelligence engine
│   │   ├── 📁 src/
│   │   │   ├── 📁 models/                   # 🧠 AI model definitions
│   │   │   ├── 📁 services/                 # ⚡ AI processing services
│   │   │   └── 📁 utils/                    # 🛠️ AI helper functions
│   │   ├── app.py                           # 🐍 Main Python AI server
│   │   ├── requirements.txt                 # 📋 Python dependencies list
│   │   └── Dockerfile                       # 🐳 AI service container config
│   │
│   ├── 📁 docker/                           # 🐳 Docker configuration files
│   │   └── mongo-init.js                    # 🗃️ Database initialization
│   ├── docker-compose.yml                   # 🎼 Multi-container orchestration
│   └── README.md                            # 📖 Application-specific documentation
│
├── 📁 event-monitoring-mvp-architecture/    # 📐 Project architecture & planning
│   ├── 📁 team-documentation/               # 📚 COMPREHENSIVE TEAM GUIDES
│   │   ├── 01-PROJECT-OVERVIEW.md           # 🎯 What we're building & why
│   │   ├── 02-TECHNOLOGY-STACK.md           # 🛠️ Complete tech explanations
│   │   ├── 03-ARCHITECTURE-DIAGRAMS.md      # 🏗️ System design & patterns
│   │   ├── 04-DEVELOPMENT-WORKFLOW.md       # 🔄 How to work on the project
│   │   ├── 05-IMPLEMENTATION-ROADMAP.md     # 🗺️ Future development plans
│   │   ├── 06-BEGINNER-GUIDE.md            # 🎓 Complete programming intro
│   │   └── README.md                        # 📋 Documentation index
│   ├── 📁 docs/                             # 📄 Additional technical docs
│   └── 📁 src/                              # 🔧 Architecture planning code
│
├── 📁 chatdetails/                          # 💬 Development conversation logs
├── .gitignore                               # 🚫 Files Git should ignore
└── README.md                                # 📖 THIS FILE - Project overview
```

---

## 🚀 Quick Start Guide

### **For Complete Beginners**
If you're new to programming, start here:
1. 📚 **Read the documentation**: Go to `event-monitoring-mvp-architecture/team-documentation/`
2. 🎓 **Start with**: `06-BEGINNER-GUIDE.md` for programming fundamentals
3. 📖 **Then read**: `01-PROJECT-OVERVIEW.md` to understand what we're building

### **For Developers**
If you have some programming experience:

#### **1. Prerequisites Setup**
```bash
# Install required software:
# ✅ Node.js 18+ (for backend & frontend)
# ✅ Python 3.9+ (for AI service)
# ✅ Docker Desktop (for easy deployment)
# ✅ Git (for version control)
# ✅ VS Code (recommended editor)
```

#### **2. Get the Code**
```bash
# Clone this repository
git clone <your-repo-url>
cd cityshob

# Navigate to the main application
cd event-monitoring-mvp
```

#### **3. Start Everything with Docker (Easiest)**
```bash
# Start all services with one command
docker-compose up --build

# After containers start, access:
# 🌐 Frontend: http://localhost:3000
# 🖥️ Backend API: http://localhost:5000
# 🤖 AI Service: http://localhost:8000
# 🗃️ MongoDB: localhost:27017
```

#### **4. Manual Setup (For Development)**
```bash
# Install backend dependencies
cd backend
npm install
npm run dev

# In a new terminal, install frontend dependencies
cd frontend
npm install
npm start

# In another terminal, setup AI service
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

## 🛠️ Technology Stack (What You'll Learn)

### **Frontend (User Interface)**
- **⚛️ React.js** - For building interactive user interfaces
- **📝 TypeScript** - JavaScript with type safety (prevents bugs)
- **🎨 Material-UI** - Beautiful, professional UI components
- **🗃️ Redux Toolkit** - Application state management
- **🔄 React Query** - Smart data fetching and caching

### **Backend (Server)**
- **💚 Node.js + Express** - JavaScript server framework
- **📝 TypeScript** - Type-safe server development
- **📡 Socket.IO** - Real-time communication (live updates)
- **🔐 JWT Authentication** - Secure user login system
- **✅ Input Validation** - Data security and validation

### **Database**
- **🍃 MongoDB** - Flexible document database
- **📊 Mongoose** - Object modeling for Node.js

### **AI & Machine Learning**
- **🐍 Python + FastAPI** - AI service backend
- **👁️ YOLOv8** - State-of-the-art object detection
- **📹 OpenCV** - Computer vision and video processing
- **🧠 Ultralytics** - Machine learning model management

### **DevOps & Deployment**
- **🐳 Docker** - Containerization for consistent deployment
- **📝 Docker Compose** - Multi-service orchestration
- **📚 Git** - Version control and team collaboration

---

## 📚 Learning Resources (For Students)

### **Essential Reading (Start Here)**
1. **`team-documentation/01-PROJECT-OVERVIEW.md`** - Understand the complete project
2. **`team-documentation/06-BEGINNER-GUIDE.md`** - Programming fundamentals
3. **`team-documentation/02-TECHNOLOGY-STACK.md`** - All technologies explained
4. **`team-documentation/04-DEVELOPMENT-WORKFLOW.md`** - How to contribute

### **Development Pathway**
```
Week 1-2:  📖 Read documentation & setup environment
Week 3-4:  🎯 Complete small tasks & bug fixes
Week 5-6:  🚀 Implement new features
Week 7-8:  🧠 Specialize (frontend, backend, or AI)
Week 9-12: 🏆 Lead feature development & mentor others
```

### **External Learning Resources**
- **JavaScript**: [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- **React**: [Official React Tutorial](https://react.dev/learn)
- **Node.js**: [Node.js Getting Started](https://nodejs.org/en/docs/guides/getting-started-guide/)
- **Python**: [Python Tutorial](https://docs.python.org/3/tutorial/)
- **Git**: [Git Handbook](https://guides.github.com/introduction/git-handbook/)

---

## 🎯 Project Features (What's Already Built)

### ✅ **Completed Features**
- 🔐 **User Authentication** - Secure login with JWT tokens
- 👥 **User Management** - Admin, Manager, and Guard roles
- 📹 **Camera Management** - Add, configure, and monitor cameras
- 🚨 **Event System** - View and manage security events
- 🗺️ **Interactive Map** - Mapbox integration with camera/event markers
- 📊 **Dashboard** - Real-time statistics and recent activity
- ⚙️ **Settings** - User preferences and system configuration
- 📱 **Real-time Updates** - Live event notifications via WebSocket

### 🚧 **In Development**
- 🤖 **AI Object Detection** - YOLOv8 integration for automatic detection
- 📹 **Live Video Streams** - Real-time camera feed viewing
- 📧 **Email Alerts** - Automatic notifications for critical events

### 🔮 **Planned Features**
- 📱 **Mobile App** - React Native mobile application
- 📈 **Advanced Analytics** - Detailed reporting and insights
- 🏢 **Enterprise Features** - Multi-tenant support and advanced AI

---

## 🤝 Contributing to the Project

### **For New Developers**
1. **🎓 Start Learning** - Read the beginner guide and complete tutorials
2. **🔧 Setup Environment** - Follow the quick start guide above
3. **👶 Pick Small Tasks** - Start with UI improvements or bug fixes
4. **📝 Follow Workflow** - Use Git branches and pull requests
5. **🤝 Ask Questions** - Use team chat for help and guidance

### **Development Process**
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test locally
npm test
docker-compose up --build

# 3. Commit with descriptive message
git add .
git commit -m "feat: add camera offline alert feature"

# 4. Push and create pull request
git push origin feature/your-feature-name
```

### **Code Quality Standards**
- ✅ Write tests for new features
- 📝 Add comments explaining complex logic
- 🎨 Follow existing code style
- 🔍 Test changes thoroughly before submitting
- 📖 Update documentation when needed

---

## 📊 Project Status

| Component | Status | Description |
|-----------|--------|-------------|
| 🎨 Frontend | ✅ **Complete** | Full React app with all pages and components |
| 🖥️ Backend | ✅ **Complete** | REST API with authentication and data management |
| 🗃️ Database | ✅ **Complete** | MongoDB with proper schemas and indexing |
| 🤖 AI Service | 🚧 **In Progress** | Basic structure ready, AI model integration pending |
| 📱 Real-time | ✅ **Complete** | WebSocket communication for live updates |
| 🐳 Deployment | ✅ **Complete** | Docker containerization for all services |
| 📚 Documentation | ✅ **Complete** | Comprehensive guides for team development |

---

## 🆘 Getting Help

### **When You're Stuck**
1. 📖 **Check Documentation** - Most questions are answered in `team-documentation/`
2. 🔍 **Search Issues** - Look for similar problems in GitHub issues
3. 💬 **Ask Team** - Use team communication channels
4. 🤝 **Pair Programming** - Work with experienced developers
5. 📝 **Create Issue** - Document bugs or request features

### **Common Issues & Solutions**
```bash
# Frontend won't start
cd frontend && rm -rf node_modules && npm install

# Backend database connection error
docker-compose up mongo

# AI service dependencies missing
cd ai-service && pip install -r requirements.txt

# Git merge conflicts
git status
# Resolve conflicts in files, then:
git add . && git commit
```

---

## 🏆 Success Metrics

### **Technical Goals**
- 🎯 **Detection Accuracy**: >95% for person detection
- ⚡ **Response Time**: <200ms API responses
- 🔄 **Real-time Latency**: <100ms for live updates
- ✅ **Code Coverage**: >80% test coverage
- 🔧 **Build Time**: <5 minutes full build

### **Learning Goals**
- 🎓 **Team Skill Growth**: All members contribute meaningfully
- 📚 **Knowledge Sharing**: Regular code reviews and mentoring
- 🚀 **Project Delivery**: Working MVP in production
- 🤝 **Collaboration**: Effective teamwork and communication

---

## 📄 License & Usage

This project is designed for educational and learning purposes. It demonstrates modern web development practices, AI integration, and team collaboration workflows.

**Learning Focus Areas:**
- Full-stack web development
- AI/ML integration in real applications
- Modern DevOps practices
- Team collaboration and Git workflows
- Security and authentication systems

---

## 👥 Team & Contact

**Project Type:** Educational Security Monitoring MVP  
**Target Audience:** Student developers learning full-stack development  
**Tech Stack:** React + Node.js + Python + MongoDB + Docker  
**Learning Level:** Beginner to Intermediate  

**Get Started:** Read `event-monitoring-mvp-architecture/team-documentation/README.md` for complete guidance!

---

<div align="center">
  <h3>🎓 Built for Learning • 🚀 Production Ready • 🤝 Team Focused</h3>
  <p><em>A comprehensive platform for students to learn modern software development through real-world application building</em></p>
</div>