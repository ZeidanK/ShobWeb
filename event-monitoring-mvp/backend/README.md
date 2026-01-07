# Backend - Event Monitoring MVP

Node.js/Express backend API providing authentication, camera management, event processing, and real-time communication for the Event Monitoring system.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** 6.0+ running locally or via Docker
- **TypeScript** knowledge recommended

### Development Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Configure your settings
   nano .env
   ```

3. **Start MongoDB**
   ```bash
   # Option 1: Local MongoDB
   mongod --dbpath ./data
   
   # Option 2: Docker MongoDB
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Setup**
   - API available at: http://localhost:5000
   - Health check: http://localhost:5000/api/health
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Start Development Server
```bash
npm run dev
```

The backend API will be available at: http://localhost:5000

## Environment Configuration

Edit the `.env` file with these settings:

```bash
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/event_monitoring

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# External Services
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Video Streaming
MAX_CAMERAS=5
VIDEO_CHUNK_SIZE=1024

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Available Scripts

### Development
```bash
npm run dev        # Start with hot reload (recommended)
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## Database Setup

### MongoDB Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb/brew/mongodb-community  # macOS
```

### Initialize Database
```bash
# Import initial data (creates admin user)
mongosh event_monitoring < ../docker/mongo-init.js
```

Default admin user:
- **Email**: admin@example.com
- **Password**: password123

## API Documentation

### Authentication Endpoints
```bash
# Login
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Register new user
POST /api/auth/register
{
  "username": "operator1",
  "email": "operator@example.com", 
  "password": "password123",
  "role": "operator"
}

# Get user profile
GET /api/auth/profile
Headers: Authorization: Bearer <jwt-token>
```

### Camera Endpoints
```bash
# List all cameras
GET /api/cameras
Headers: Authorization: Bearer <jwt-token>

# Create new camera
POST /api/cameras
Headers: Authorization: Bearer <jwt-token>
{
  "name": "Front Gate Camera",
  "description": "Main entrance monitoring",
  "streamUrl": "rtsp://camera-ip:554/stream",
  "location": {
    "coordinates": [-74.0060, 40.7128],
    "address": "123 Main St, New York, NY"
  },
  "type": "ip",
  "settings": {
    "resolution": "1920x1080",
    "fps": 30,
    "recordingEnabled": true
  }
}
```

### Event Endpoints
```bash
# List events with filtering
GET /api/events?status=open&type=person_detected&page=1&limit=20
Headers: Authorization: Bearer <jwt-token>

# Create new event (usually from AI service)
POST /api/events
Headers: Authorization: Bearer <jwt-token>
{
  "title": "Person Detected",
  "description": "AI detected person with 85% confidence",
  "type": "person_detected",
  "severity": "medium",
  "cameraId": "camera-object-id",
  "location": {
    "coordinates": [-74.0060, 40.7128]
  },
  "detectionData": {
    "confidence": 0.85,
    "boundingBox": {"x": 100, "y": 150, "width": 200, "height": 300},
    "objectCount": 1,
    "aiModel": "YOLOv8"
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Main application file
│   ├── controllers/        # Route handlers
│   │   ├── authController.ts
│   │   ├── cameraController.ts
│   │   ├── eventController.ts
│   │   └── userController.ts
│   ├── models/             # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Camera.ts
│   │   └── Event.ts
│   ├── routes/             # API route definitions
│   │   ├── auth.ts
│   │   ├── cameras.ts
│   │   ├── events.ts
│   │   └── users.ts
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
│       └── database.ts
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Role-based Access**: Admin/operator permissions

## Socket.IO Real-time Features

The backend includes Socket.IO for real-time updates:

```javascript
// Client connection
const socket = io('http://localhost:5000');

// Join room for updates
socket.emit('join-room', 'events');

// Listen for new events
socket.on('new-event', (event) => {
  console.log('New event:', event);
});
```

## Troubleshooting

### Common Issues

**1. MongoDB connection failed:**
```bash
# Check MongoDB status
sudo systemctl status mongod
sudo systemctl start mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/event_monitoring
```

**2. TypeScript compilation errors:**
```bash
# Clean build
rm -rf dist
npm run build

# Install missing types
npm install --save-dev @types/missing-package
```

**3. JWT token issues:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Update JWT_SECRET in .env
```

**4. Port already in use:**
```bash
# Kill process on port 5000
sudo lsof -t -i:5000 | xargs kill -9
# Or change port in .env
PORT=5001
```

### Development Tips

1. **Hot Reload**: Use `npm run dev` for automatic restarts
2. **Logging**: Check terminal output for request logs
3. **Database Inspection**: Use MongoDB Compass or `mongosh`
4. **API Testing**: Use Postman, curl, or browser dev tools

### Health Check

Test if the backend is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-12T...",
  "service": "event-monitoring-backend"
}
```

## Integration with Other Services

### AI Service Integration
The backend automatically receives events from the AI service at:
```
POST /api/events
```

### Frontend Integration
Configure frontend to use this backend:
```bash
# In frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://prod-host:27017/event_monitoring
JWT_SECRET=super-long-random-production-secret
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start dist/app.js --name "event-monitoring-backend"

# Using systemd
sudo systemctl enable event-monitoring-backend
sudo systemctl start event-monitoring-backend
```