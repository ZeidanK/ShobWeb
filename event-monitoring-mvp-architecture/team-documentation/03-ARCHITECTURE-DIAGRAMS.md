# System Architecture & Design Patterns

## 🏗️ Architecture Overview

Our Event Monitoring MVP follows a **microservices architecture** with clear separation of concerns. This design makes the system scalable, maintainable, and allows different teams to work on different parts independently.

## 🎯 Architectural Principles

### 1. **Separation of Concerns**
Each service has one primary responsibility:
- **Frontend**: User interface and user experience
- **Backend**: Business logic and data management  
- **AI Service**: Computer vision and event detection
- **Database**: Data persistence and retrieval

### 2. **Loose Coupling**
Services communicate through well-defined APIs, not direct code dependencies:
```
Frontend ←→ REST API ←→ Backend ←→ MongoDB
                ↕
         AI Service ←→ WebSocket
```

### 3. **High Cohesion**
Related functionality is grouped together within each service.

### 4. **Scalability**
Each service can be scaled independently based on demand.

## 🏛️ Detailed Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  👤 Security Guards    👤 Managers    👤 Administrators             │
│           │                 │                 │                     │
│           └─────────────────┼─────────────────┘                     │
│                             │                                       │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼─────────────────────────────────────────┐
│                      PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                    React Frontend (Port 3000)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │  Dashboard  │ │   Events    │ │   Cameras   │ │   MapView   │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │  LiveView   │ │   Profile   │ │  Settings   │ │    Login    │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                             │                                       │
│  State Management: Redux    │ Real-time: Socket.IO                  │
│  HTTP Clients: React Query │ UI Components: Material-UI              │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │ REST API + WebSocket
┌─────────────────────────────▼─────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                   Node.js Backend (Port 5000)                      │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │    Auth     │ │   Camera    │ │    Event    │ │    User     │    │
│  │ Controller  │ │ Controller  │ │ Controller  │ │ Controller  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│         │               │               │               │           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ Auth Routes │ │Camera Routes│ │Event Routes │ │ User Routes │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                             │                                       │
│  Middleware: JWT Auth       │ Real-time: Socket.IO Server           │
│  Validation & Error Handling│ API Framework: Express.js             │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │ HTTP Requests
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         │         ▼
┌─────────────────────────────┐│ ┌─────────────────────────────────────────┐
│      AI SERVICE             ││ │            DATA LAYER                   │
│   Python (Port 8000)       ││ │                                         │
│                             ││ │         MongoDB (Port 27017)            │
│  ┌─────────────────────┐    ││ │                                         │
│  │   YOLOv8 Model      │    ││ │  ┌─────────────┐ ┌─────────────────┐    │
│  │  Object Detection   │    ││ │  │    Users    │ │     Cameras     │    │
│  └─────────────────────┘    ││ │  │ Collection  │ │   Collection    │    │
│  ┌─────────────────────┐    ││ │  └─────────────┘ └─────────────────┘    │
│  │   OpenCV Video      │    ││ │  ┌─────────────┐ ┌─────────────────┐    │
│  │    Processing       │    ││ │  │   Events    │ │     Sessions    │    │
│  └─────────────────────┘    ││ │  │ Collection  │ │   Collection    │    │
│  ┌─────────────────────┐    ││ │  └─────────────┘ └─────────────────┘    │
│  │   FastAPI Server    │    ││ │                                         │
│  │   REST Endpoints    │    ││ │  Indexes: User email, Camera location   │
│  └─────────────────────┘    ││ │  Sharding: Ready for horizontal scale   │
└─────────────────────────────┘│ └─────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                         Docker Containers                           │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │  frontend   │ │   backend   │ │ ai-service  │ │    mongo    │    │
│  │ container   │ │  container  │ │  container  │ │  container  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                                     │
│  Network: event-monitoring-network                                  │
│  Volumes: mongo_data, ai_models                                     │
│  Environment: .env files for configuration                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────────┐
│                        EXTERNAL LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📹 RTSP Cameras  🌐 Mapbox API  📧 Email Service  📱 SMS Service    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Patterns

### 1. **User Authentication Flow**
```
User Input → Frontend → Backend → MongoDB → JWT → Frontend → Local Storage
```

**Detailed Steps:**
1. User enters credentials in Login component
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials against MongoDB users collection
4. Backend generates JWT token with user info
5. Frontend receives token and stores in localStorage
6. Frontend redirects to Dashboard
7. All subsequent requests include JWT in Authorization header

### 2. **Real-Time Event Detection Flow**
```
Camera Stream → AI Service → Backend → MongoDB → Socket.IO → Frontend
```

**Detailed Steps:**
1. Camera sends RTSP stream to AI Service
2. AI Service processes frame with YOLOv8
3. Detection found → AI Service sends HTTP POST to Backend
4. Backend validates and stores event in MongoDB
5. Backend broadcasts event via Socket.IO to all connected clients
6. Frontend receives real-time event and updates UI
7. User sees instant notification and updated event list

### 3. **Camera Management Flow**
```
User Action → Frontend → Backend → MongoDB → Socket.IO → All Clients
```

**Detailed Steps:**
1. User adds/modifies camera in Camera component
2. Frontend sends API request to backend
3. Backend validates and updates camera in MongoDB
4. Backend broadcasts camera status change via Socket.IO
5. All connected clients update their camera displays
6. Map view updates with new camera location

## 🏗️ Design Patterns Used

### 1. **Model-View-Controller (MVC) - Backend**

#### **Models** (`/backend/src/models/`)
Define data structure and business rules:
```javascript
// User.ts - Defines user data structure
export interface IUser {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  lastLoginAt?: Date;
}

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'guard'], default: 'guard' },
  // ... more fields
});
```

#### **Views** (API Responses)
Controllers format data for frontend consumption:
```javascript
// Clean user data for frontend (no password!)
const userResponse = {
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  profile: user.profile
};
```

#### **Controllers** (`/backend/src/controllers/`)
Handle business logic and coordinate between models and views:
```javascript
// userController.ts
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

### 2. **Component-Based Architecture - Frontend**

#### **Container Components** (Smart Components)
Manage state and data:
```javascript
// Dashboard.tsx - Container component
function Dashboard() {
  const { data: cameras } = useQuery(['cameras'], fetchCameras);
  const { data: events } = useQuery(['events'], fetchRecentEvents);
  const dispatch = useDispatch();
  
  return (
    <Layout>
      <DashboardStats cameras={cameras} />
      <RecentEvents events={events} />
      <QuickActions onRefresh={() => dispatch(refreshData())} />
    </Layout>
  );
}
```

#### **Presentation Components** (Dumb Components)
Just display data:
```javascript
// DashboardStats.tsx - Presentation component
interface DashboardStatsProps {
  cameras: Camera[];
}

function DashboardStats({ cameras }: DashboardStatsProps) {
  const onlineCount = cameras.filter(c => c.status === 'online').length;
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Total Cameras" value={cameras.length} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Online" value={onlineCount} color="success" />
      </Grid>
    </Grid>
  );
}
```

### 3. **Repository Pattern - Data Access**

#### **Database Layer Abstraction**
```javascript
// database.ts - Repository pattern
export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }
  
  async create(userData: CreateUserData): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
  
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }
}

// Usage in controller
const userRepo = new UserRepository();
const user = await userRepo.findByEmail(email);
```

### 4. **Observer Pattern - Real-Time Updates**

#### **Socket.IO Event System**
```javascript
// Backend - Event broadcasting
class EventNotificationService {
  private io: SocketIOServer;
  
  broadcastNewEvent(event: IEvent) {
    this.io.emit('new-event', {
      id: event._id,
      type: event.type,
      cameraId: event.cameraId,
      timestamp: event.createdAt,
      severity: event.severity
    });
  }
  
  broadcastCameraStatus(cameraId: string, status: string) {
    this.io.emit('camera-status-changed', { cameraId, status });
  }
}

// Frontend - Event listening
useEffect(() => {
  socket.on('new-event', (event) => {
    dispatch(addEvent(event));
    showNotification(`${event.type} detected!`);
  });
  
  socket.on('camera-status-changed', ({ cameraId, status }) => {
    dispatch(updateCameraStatus({ cameraId, status }));
  });
}, []);
```

### 5. **Factory Pattern - Service Creation**

#### **Service Factory for AI Models**
```python
# ai-service/src/services/model_factory.py
class ModelFactory:
    @staticmethod
    def create_detector(model_type: str):
        if model_type == 'yolov8':
            return YOLOv8Detector()
        elif model_type == 'faster_rcnn':
            return FasterRCNNDetector()
        else:
            raise ValueError(f"Unknown model type: {model_type}")

# Usage
detector = ModelFactory.create_detector('yolov8')
results = detector.detect(frame)
```

### 6. **Middleware Pattern - Request Processing**

#### **Authentication Middleware**
```javascript
// auth.ts middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = (decoded as any).userId;
    next();
  });
};

// Usage in routes
router.get('/cameras', authenticateToken, getCameras);
```

## 📊 Database Design

### **Collection Schemas**

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  passwordHash: String,
  role: String ('admin' | 'manager' | 'guard'),
  profile: {
    firstName: String,
    lastName: String,
    department: String,
    phoneNumber: String
  },
  settings: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    theme: String ('light' | 'dark')
  },
  createdAt: Date,
  lastLoginAt: Date
}
```

#### Cameras Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    zone: String
  },
  streamUrl: String,
  status: String ('online' | 'offline' | 'maintenance'),
  settings: {
    resolution: String,
    frameRate: Number,
    nightVision: Boolean,
    motionDetection: Boolean
  },
  aiEnabled: Boolean,
  lastSeen: Date,
  createdAt: Date,
  createdBy: ObjectId (ref: 'User')
}
```

#### Events Collection
```javascript
{
  _id: ObjectId,
  type: String ('person_detected' | 'vehicle_detected' | 'motion_detected'),
  cameraId: ObjectId (ref: 'Camera', indexed),
  severity: String ('low' | 'medium' | 'high' | 'critical'),
  confidence: Number (0-1),
  boundingBox: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  metadata: {
    objectCount: Number,
    detectedClasses: [String],
    frameNumber: Number
  },
  status: String ('pending' | 'acknowledged' | 'resolved'),
  acknowledgedBy: ObjectId (ref: 'User'),
  acknowledgedAt: Date,
  createdAt: Date (indexed)
}
```

#### Sessions Collection (for JWT blacklisting)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  tokenHash: String,
  expiresAt: Date (indexed, TTL),
  createdAt: Date,
  userAgent: String,
  ipAddress: String
}
```

### **Database Indexes for Performance**
```javascript
// Critical indexes for query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.cameras.createIndex({ name: 1 });
db.cameras.createIndex({ "location.zone": 1 });
db.cameras.createIndex({ status: 1 });

db.events.createIndex({ cameraId: 1, createdAt: -1 });
db.events.createIndex({ type: 1, createdAt: -1 });
db.events.createIndex({ severity: 1, status: 1 });
db.events.createIndex({ createdAt: -1 }); // Recent events

db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
```

## 🔒 Security Architecture

### **Defense in Depth Strategy**

#### 1. **Frontend Security**
- JWT token stored securely (httpOnly cookies in production)
- Input validation and sanitization
- XSS prevention with Content Security Policy
- CSRF protection for state-changing operations

#### 2. **API Security**
- JWT authentication on all protected routes
- Rate limiting to prevent abuse
- Input validation with Joi/Yup schemas
- SQL injection prevention (using ODM)
- CORS configuration for allowed origins

#### 3. **Database Security**
- MongoDB authentication enabled
- Database connections over encrypted channels
- Sensitive data encryption at rest
- Regular security updates and patches

#### 4. **Infrastructure Security**
- Docker containers with minimal attack surface
- Network segmentation with Docker networks
- Environment variables for sensitive configuration
- SSL/TLS encryption for all external communications

### **Authentication & Authorization Flow**
```
1. User Login → Credentials validation → JWT generation
2. JWT contains: { userId, role, exp, iat }
3. Every API request → JWT verification → Role-based access
4. Roles: 'admin' (full access), 'manager' (read/write), 'guard' (read-only)
```

## 🚀 Scalability Considerations

### **Horizontal Scaling Strategy**

#### 1. **Stateless Services**
- No server-side sessions (JWT tokens)
- Each request contains all necessary information
- Services can be replicated without shared state

#### 2. **Database Scaling**
- MongoDB sharding by camera location/zone
- Read replicas for heavy read workloads
- Separate analytics database for historical data

#### 3. **Caching Strategy**
- Redis for session management and real-time data
- Browser caching for static assets
- API response caching for frequently requested data

#### 4. **Load Balancing**
```
Internet → Load Balancer → Multiple Backend Instances
                      → Multiple AI Service Instances
                      → MongoDB Cluster
```

### **Performance Optimization**

#### 1. **Frontend Optimization**
- Code splitting for faster initial load
- Lazy loading of components
- Image compression and optimization
- CDN for static assets

#### 2. **Backend Optimization**
- Database query optimization
- Connection pooling
- Asynchronous processing for heavy operations
- API response compression

#### 3. **AI Service Optimization**
- Model optimization for inference speed
- GPU acceleration for video processing
- Batch processing of multiple streams
- Result caching for recent frames

## 🔄 DevOps & Deployment Architecture

### **Environment Strategy**
```
Development → Testing → Staging → Production
     ↓           ↓         ↓          ↓
Docker Compose  K8s    K8s Cluster  K8s Cluster
Local DB        Test DB   Stage DB   Prod DB
```

### **CI/CD Pipeline**
```
Code Commit → GitHub Actions → Tests → Build → Deploy
                    ↓
              Unit Tests + Integration Tests
                    ↓
              Docker Image Build
                    ↓
              Security Scanning
                    ↓
              Automated Deployment
```

This architecture provides a robust, scalable, and maintainable foundation for our Event Monitoring MVP. Each pattern and design decision supports our goals of reliability, performance, and developer productivity while maintaining security and scalability for future growth.