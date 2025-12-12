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
- Node.js 18+ and npm 8+
- Python 3.9+
- MongoDB 6.0+
- Git

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start development server
npm run dev
```

Backend will run on: http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Add your Mapbox token to .env

# Start development server
npm start
```

Frontend will run on: http://localhost:3000

### 3. AI Service Setup
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment setup
cp .env.example .env

# Start service
python app.py
```

AI Service will run on: http://localhost:8000

### 4. Database Setup
```bash
# Start MongoDB (if not using Docker)
mongod

# Import initial data (optional)
mongosh < docker/mongo-init.js
```

## 📁 Project Structure

```
event-monitoring-mvp/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation, etc.
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API clients
│   │   └── utils/        # Helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── ai-service/           # Python AI service
│   ├── src/
│   │   ├── models/       # AI models
│   │   ├── services/     # Detection logic
│   │   └── utils/        # Helpers
│   ├── requirements.txt
│   ├── app.py
│   └── .env.example
├── docker/               # Database config
├── docker-compose.yml    # Full stack deployment
└── README.md            # This file
```

## 🔧 Environment Configuration

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event_monitoring
JWT_SECRET=your-super-secret-jwt-key
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token-here
```

### AI Service (.env)
```bash
API_URL=http://localhost:5000/api
MODEL_PATH=./models
CONFIDENCE_THRESHOLD=0.5
DEVICE=cpu
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Cameras
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Create new camera
- `GET /api/cameras/:id` - Get camera details
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera

### Events
- `GET /api/events` - List events (with filtering)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id/acknowledge` - Acknowledge event
- `PATCH /api/events/:id/resolve` - Resolve event

### AI Service
- `GET /health` - Health check
- `POST /start-detection` - Start camera detection
- `POST /stop-detection/:id` - Stop camera detection

## 🎯 MVP Features

✅ **Authentication**: JWT-based login/logout  
✅ **Camera Management**: Add, edit, delete cameras  
✅ **Live Video**: Stream from IP cameras  
✅ **AI Detection**: People and vehicle detection  
✅ **Event Management**: View, acknowledge, resolve events  
✅ **Map View**: Camera locations and event visualization  
✅ **Real-time Updates**: Socket.IO for live data  
✅ **Role-based Access**: Admin and operator roles  

## 🚧 Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Find and kill process
sudo lsof -t -i:3000 | xargs kill -9  # Frontend
sudo lsof -t -i:5000 | xargs kill -9  # Backend
sudo lsof -t -i:8000 | xargs kill -9  # AI Service
```

**2. MongoDB connection failed:**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Start MongoDB
sudo systemctl start mongod
```

**3. Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For Python dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**4. Docker issues:**
```bash
# Reset Docker
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

## 📱 Usage Guide

### 1. Login
- Use default admin credentials or create new users
- Admins can manage users, cameras, and all events
- Operators can view events and acknowledge them

### 2. Camera Management
- Add IP cameras with RTSP/HTTP stream URLs
- Set camera locations for map visualization
- Configure detection settings

### 3. Event Monitoring
- View real-time events from AI detection
- Filter by type, severity, status, date range
- Acknowledge and resolve events
- Add notes and assign to operators

### 4. Map View
- See camera locations on interactive map
- View events clustered by location
- Click markers for camera/event details

## 🔄 Development Workflow

### Making Changes
1. **Frontend**: Edit files in `frontend/src/`, changes auto-reload
2. **Backend**: Edit files in `backend/src/`, restart with `npm run dev`
3. **AI Service**: Edit `ai-service/app.py`, restart with `python app.py`

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests (when implemented)
cd backend && npm test

# API testing with curl
curl http://localhost:5000/health
curl http://localhost:8000/health
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
- Change `JWT_SECRET` to a strong random string
- Use production MongoDB URI
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Use HTTPS URLs

## 📞 Support

For issues or questions:
1. Check this README and individual service READMEs
2. Review application logs in browser console and terminal
3. Check Docker logs: `docker-compose logs [service-name]`

## 🎯 Next Steps

After the MVP is running:
1. **Add Real Cameras**: Configure actual IP camera streams
2. **Mapbox Setup**: Get API token for map functionality  
3. **Notifications**: Implement email/SMS alerts
4. **Analytics**: Add dashboards and reporting
5. **Mobile App**: Build React Native companion app