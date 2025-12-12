# Technology Stack Guide - Understanding Our Tools

## 🎓 Learning Path: From Beginner to Advanced

This guide explains all the technologies we use in our Event Monitoring MVP, designed specifically for students and new developers. Each section includes what the technology does, why we chose it, and how it fits into our project.

## 🌐 Frontend Technologies (What Users See)

### React.js ⚛️
**What it is**: A JavaScript library for building user interfaces
**Think of it as**: Like building with LEGO blocks - each component is a reusable piece

#### Why We Chose React
- **Component-Based**: Build once, use anywhere (like creating a "Login Button" and using it on multiple pages)
- **Large Community**: Millions of developers, tons of tutorials and help
- **Job Market**: High demand skill in the industry
- **Fast Development**: Hot reloading means you see changes instantly

#### How We Use It
```javascript
// Example: A simple camera component
function CameraCard({ camera }) {
  return (
    <div className="camera-card">
      <h3>{camera.name}</h3>
      <p>Status: {camera.online ? 'Online' : 'Offline'}</p>
    </div>
  );
}
```

#### Learning Resources
- **Official Tutorial**: [React Tutorial](https://react.dev/learn)
- **Our Implementation**: Look at `/frontend/src/components/` folder
- **Key Concepts to Learn**: Components, Props, State, JSX syntax

---

### TypeScript 📝
**What it is**: JavaScript with type checking
**Think of it as**: Adding guardrails to prevent common programming mistakes

#### Why We Chose TypeScript
- **Catch Bugs Early**: Tells you about errors before your code runs
- **Better IDE Support**: Auto-completion and intelligent suggestions
- **Easier Refactoring**: Change code safely across the entire project
- **Industry Standard**: Most modern projects use TypeScript

#### Example Comparison
```javascript
// Regular JavaScript (can cause runtime errors)
function addNumbers(a, b) {
  return a + b;
}
addNumbers("5", 3); // Returns "53" (string concatenation) - Bug!

// TypeScript (prevents the error)
function addNumbers(a: number, b: number): number {
  return a + b;
}
addNumbers("5", 3); // ERROR: Cannot assign string to number parameter
```

#### Learning Resources
- **Official Handbook**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Our Types**: Check `/frontend/src/types/` and `/backend/src/types/`
- **Key Concepts**: Basic types, interfaces, generics

---

### Material-UI (MUI) 🎨
**What it is**: Pre-built, beautiful UI components for React
**Think of it as**: A design toolkit with professional-looking buttons, forms, and layouts

#### Why We Chose Material-UI
- **Google's Design System**: Based on Material Design principles
- **Accessibility**: Built-in support for screen readers and keyboard navigation
- **Consistency**: All components look and feel cohesive
- **Time Saving**: Don't need to design buttons, forms, etc. from scratch

#### How We Use It
```javascript
import { Button, TextField, Card } from '@mui/material';

function LoginForm() {
  return (
    <Card>
      <TextField label="Username" variant="outlined" />
      <TextField label="Password" type="password" variant="outlined" />
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Card>
  );
}
```

#### Learning Resources
- **Official Documentation**: [MUI Docs](https://mui.com/)
- **Our Usage**: Look at any component in `/frontend/src/components/`
- **Key Concepts**: Theme system, component props, responsive design

---

### Redux Toolkit 🗃️
**What it is**: State management for React applications
**Think of it as**: A global storage box that any component can read from or write to

#### Why We Need State Management
Imagine you're logged in as "John Smith". Without Redux:
- Every component needs to ask "Who is logged in?" 
- When you logout, every component needs to be told individually
- Data gets messy and hard to track

With Redux:
- One central place stores "John Smith is logged in"
- Any component can check this instantly
- When you logout, one action updates everywhere

#### How We Use It
```javascript
// Store user information globally
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoggedIn: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    }
  }
});
```

#### Learning Resources
- **Redux Toolkit Documentation**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Our Implementation**: `/frontend/src/store/store.ts`
- **Key Concepts**: Store, slices, actions, reducers

---

### React Query (TanStack Query) 🔄
**What it is**: Data fetching and caching library
**Think of it as**: Smart waiter who remembers your orders and doesn't ask the kitchen again if you just ordered

#### Why We Use React Query
- **Automatic Caching**: Fetch data once, use it everywhere
- **Background Updates**: Keeps data fresh without user action
- **Loading States**: Automatically handles loading, error, and success states
- **Offline Support**: Works even when internet is spotty

#### Example
```javascript
// Fetch camera data with automatic caching
function CameraList() {
  const { data: cameras, isLoading, error } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => fetch('/api/cameras').then(res => res.json()),
    refetchInterval: 5000 // Update every 5 seconds
  });

  if (isLoading) return <div>Loading cameras...</div>;
  if (error) return <div>Error loading cameras</div>;
  
  return <div>{cameras.map(camera => <CameraCard key={camera.id} camera={camera} />)}</div>;
}
```

#### Learning Resources
- **Official Documentation**: [TanStack Query](https://tanstack.com/query/latest)
- **Our Usage**: Look for `useQuery` in components
- **Key Concepts**: Queries, mutations, caching, invalidation

---

## 🖥️ Backend Technologies (The Server Brain)

### Node.js 💚
**What it is**: JavaScript runtime that lets you write server code in JavaScript
**Think of it as**: Using the same language (JavaScript) for both frontend and backend

#### Why We Chose Node.js
- **Same Language**: Team only needs to learn JavaScript/TypeScript
- **Fast Development**: Share code between frontend and backend
- **Great Package Ecosystem**: NPM has packages for everything
- **Real-time Features**: Excellent WebSocket support for live updates

#### How It Works
```javascript
// Simple server example
const express = require('express');
const app = express();

app.get('/api/cameras', (req, res) => {
  // Fetch cameras from database
  const cameras = getCamerasFromDatabase();
  res.json(cameras);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

#### Learning Resources
- **Official Documentation**: [Node.js Docs](https://nodejs.org/en/docs/)
- **Our Implementation**: `/backend/src/app.ts`
- **Key Concepts**: Event loop, modules, async/await

---

### Express.js 🚂
**What it is**: Web framework for Node.js that makes building APIs easy
**Think of it as**: The postal system that routes requests to the right destination

#### Why We Use Express
- **Simple Routing**: Easy to define API endpoints
- **Middleware Support**: Add authentication, logging, etc. easily
- **Industry Standard**: Most Node.js projects use Express
- **Flexible**: Can build APIs, websites, or both

#### How We Structure Our API
```javascript
// User authentication routes
app.post('/api/auth/login', loginController);
app.post('/api/auth/register', registerController);
app.get('/api/auth/me', authenticateToken, getCurrentUser);

// Camera management routes
app.get('/api/cameras', authenticateToken, getAllCameras);
app.post('/api/cameras', authenticateToken, addCamera);
app.put('/api/cameras/:id', authenticateToken, updateCamera);
app.delete('/api/cameras/:id', authenticateToken, deleteCamera);
```

#### Learning Resources
- **Official Documentation**: [Express.js](https://expressjs.com/)
- **Our Routes**: `/backend/src/routes/` folder
- **Key Concepts**: Routing, middleware, request/response objects

---

### MongoDB 🍃
**What it is**: NoSQL database that stores data as JSON-like documents
**Think of it as**: A filing cabinet where each folder can have different types of documents

#### Why We Chose MongoDB
- **Flexible Schema**: Easy to change data structure as project grows
- **JSON-like**: Data looks similar to JavaScript objects
- **Scalable**: Handles large amounts of data efficiently
- **Developer Friendly**: Easy to work with for web applications

#### Data Structure Examples
```javascript
// User document
{
  "_id": "user123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "security_guard",
  "createdAt": "2024-01-15T10:30:00Z",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "department": "Security"
  }
}

// Camera document
{
  "_id": "cam456",
  "name": "Main Entrance Camera",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York"
  },
  "streamUrl": "rtsp://camera.example.com:554/stream",
  "status": "online",
  "settings": {
    "resolution": "1920x1080",
    "frameRate": 30,
    "nightVision": true
  }
}
```

#### Learning Resources
- **Official Documentation**: [MongoDB Docs](https://docs.mongodb.com/)
- **Our Models**: `/backend/src/models/` folder
- **Key Concepts**: Documents, collections, queries, indexing

---

### Socket.IO 📡
**What it is**: Real-time communication between server and browser
**Think of it as**: Walkie-talkies between the server and web page

#### Why We Need Real-Time Communication
In a security system, things happen fast:
- Camera goes offline → Security team needs to know immediately
- AI detects intrusion → Alert must appear instantly on all screens
- New event occurs → All operators should see it without refreshing

#### How It Works
```javascript
// Server sends real-time updates
io.emit('camera-status-changed', {
  cameraId: 'cam456',
  status: 'offline',
  timestamp: new Date()
});

io.emit('new-event', {
  id: 'event789',
  type: 'person_detected',
  cameraId: 'cam456',
  confidence: 0.95
});

// Frontend listens for updates
socket.on('camera-status-changed', (data) => {
  updateCameraStatus(data.cameraId, data.status);
});

socket.on('new-event', (event) => {
  addEventToList(event);
  showNotification(`New ${event.type} detected!`);
});
```

#### Learning Resources
- **Official Documentation**: [Socket.IO](https://socket.io/docs/)
- **Our Implementation**: Look for `io.emit` in backend, `socket.on` in frontend
- **Key Concepts**: Events, rooms, namespaces, acknowledgments

---

## 🤖 AI/ML Technologies (The Smart Brain)

### Python 🐍
**What it is**: Programming language excellent for AI and data science
**Think of it as**: The preferred language for teaching computers to "see" and "understand"

#### Why Python for AI
- **AI Libraries**: TensorFlow, PyTorch, OpenCV all built for Python
- **Easy Syntax**: Beginner-friendly language
- **Data Science**: Great tools for working with data
- **Community**: Huge AI/ML community and resources

#### Basic AI Service Structure
```python
# AI service main application
from fastapi import FastAPI
import cv2
from ultralytics import YOLO

app = FastAPI()
model = YOLO('yolov8n.pt')  # Load AI model

@app.post("/analyze-frame")
async def analyze_frame(image_data):
    # Process the image
    results = model(image_data)
    
    # Extract detected objects
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append({
                'class': box.cls,
                'confidence': box.conf,
                'coordinates': box.xyxy
            })
    
    return {'detections': detections}
```

#### Learning Resources
- **Python Tutorial**: [Python.org Tutorial](https://docs.python.org/3/tutorial/)
- **Our AI Service**: `/ai-service/` folder
- **Key Concepts**: Functions, classes, modules, data types

---

### YOLOv8 (You Only Look Once) 👁️
**What it is**: State-of-the-art object detection AI model
**Think of it as**: A computer vision system that can instantly identify objects in images

#### How YOLO Works
1. **Input**: Give it a photo or video frame
2. **Processing**: Scans the entire image in one pass
3. **Output**: Returns what objects it found and where they are

#### What It Can Detect
- **People**: Individuals, groups, body positions
- **Vehicles**: Cars, trucks, bikes, motorcycles
- **Objects**: Bags, weapons, phones, laptops
- **Animals**: Dogs, cats, birds

#### Example Detection Result
```python
# YOLO analyzes a frame and returns:
{
  'detections': [
    {
      'class': 'person',
      'confidence': 0.95,
      'box': [100, 150, 200, 400],  # x1, y1, x2, y2 coordinates
      'center': [150, 275]
    },
    {
      'class': 'car',
      'confidence': 0.87,
      'box': [300, 200, 600, 350],
      'center': [450, 275]
    }
  ]
}
```

#### Learning Resources
- **Ultralytics Documentation**: [YOLOv8 Docs](https://docs.ultralytics.com/)
- **Computer Vision Course**: [CS231n Stanford](http://cs231n.stanford.edu/)
- **Key Concepts**: Object detection, neural networks, confidence scores

---

### OpenCV 📹
**What it is**: Computer vision library for image and video processing
**Think of it as**: Photoshop for programmers, but automated

#### What OpenCV Does
- **Read Videos**: Load video files or camera streams
- **Process Images**: Resize, filter, enhance images
- **Draw Annotations**: Add rectangles, text, lines to images
- **Video Analysis**: Detect motion, track objects

#### How We Use It
```python
import cv2

# Read video frame
cap = cv2.VideoCapture('rtsp://camera-url')
ret, frame = cap.read()

# Resize frame for processing
frame = cv2.resize(frame, (640, 480))

# Draw detection box on frame
cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
cv2.putText(frame, 'Person Detected', (x1, y1-10), 
            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

# Save or stream the annotated frame
cv2.imwrite('detection_result.jpg', frame)
```

#### Learning Resources
- **OpenCV Documentation**: [OpenCV Docs](https://docs.opencv.org/)
- **Python OpenCV Tutorial**: [OpenCV Python Tutorial](https://opencv-python-tutroals.readthedocs.io/)
- **Key Concepts**: Image arrays, color spaces, transformations

---

### FastAPI ⚡
**What it is**: Modern Python web framework for building APIs
**Think of it as**: Express.js but for Python, with automatic documentation

#### Why We Chose FastAPI for AI Service
- **Fast Performance**: One of the fastest Python frameworks
- **Automatic Documentation**: Generates API docs automatically
- **Type Safety**: Built-in support for Python type hints
- **Async Support**: Handle multiple requests simultaneously

#### Example AI API Endpoint
```python
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Event Monitoring AI Service")

class DetectionResponse(BaseModel):
    objects_found: int
    detections: list
    processing_time: float

@app.post("/detect", response_model=DetectionResponse)
async def detect_objects(image: UploadFile = File(...)):
    """
    Analyze an image and detect objects
    """
    # Process the uploaded image
    image_data = await image.read()
    results = await process_with_yolo(image_data)
    
    return DetectionResponse(
        objects_found=len(results),
        detections=results,
        processing_time=0.15
    )
```

#### Learning Resources
- **FastAPI Documentation**: [FastAPI Docs](https://fastapi.tiangolo.com/)
- **Our AI Service**: `/ai-service/app.py`
- **Key Concepts**: Path operations, dependency injection, background tasks

---

## 🛠️ DevOps & Deployment Technologies

### Docker 🐳
**What it is**: Containerization platform that packages applications with all dependencies
**Think of it as**: Shipping containers for software - works the same everywhere

#### Why We Use Docker
- **Consistency**: Runs the same on your laptop, server, or cloud
- **Isolation**: Each service runs independently
- **Easy Deployment**: Ship the container, not the code
- **Development**: Everyone gets identical environment

#### How Our Docker Setup Works
```yaml
# docker-compose.yml - Orchestrates all services
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/eventmonitoring
    depends_on:
      - mongo
  
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    volumes:
      - ./ai-service/models:/app/models
  
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
```

#### Learning Resources
- **Docker Documentation**: [Docker Docs](https://docs.docker.com/)
- **Our Docker Files**: `Dockerfile` in each service folder
- **Key Concepts**: Images, containers, volumes, networks

---

### Git & GitHub 📚
**What it is**: Version control system for tracking code changes
**Think of it as**: Google Docs version history, but for code

#### Why Version Control is Critical
- **Track Changes**: See what changed, when, and who changed it
- **Collaboration**: Multiple developers can work on same project
- **Backup**: Code is stored safely in multiple places
- **Branching**: Work on features without breaking main code

#### Basic Git Workflow
```bash
# Download the project
git clone https://github.com/your-team/event-monitoring-mvp.git

# Create a new feature branch
git checkout -b feature/add-camera-settings

# Make changes, then stage them
git add .

# Commit with descriptive message
git commit -m "Add camera resolution settings to UI"

# Push to GitHub
git push origin feature/add-camera-settings

# Create Pull Request on GitHub for team review
```

#### Learning Resources
- **Git Tutorial**: [Git Tutorial](https://git-scm.com/docs/gittutorial)
- **GitHub Guides**: [GitHub Guides](https://guides.github.com/)
- **Key Concepts**: Repositories, branches, commits, merges, pull requests

---

## 🌐 Additional Important Technologies

### JWT (JSON Web Tokens) 🔐
**What it is**: Secure way to transmit information between parties
**Think of it as**: Digital passport that proves who you are

#### How JWT Authentication Works
1. User logs in with username/password
2. Server verifies credentials
3. Server creates JWT token with user info
4. Client stores token and sends with every request
5. Server verifies token to authenticate requests

```javascript
// JWT structure
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "123",
    "username": "john_doe",
    "role": "security_guard",
    "exp": 1640995200  // Expiration time
  },
  "signature": "secret-signature-hash"
}
```

---

### WebRTC 📹
**What it is**: Real-time communication for browsers (video, audio, data)
**Think of it as**: Video calling technology built into browsers

#### Why We'll Use WebRTC
- **Low Latency**: Minimal delay for live video
- **Browser Native**: No plugins required
- **Peer-to-Peer**: Direct connection when possible
- **Adaptive**: Adjusts quality based on connection

---

### Mapbox 🗺️
**What it is**: Platform for custom maps and location services
**Think of it as**: Google Maps that you can customize for your needs

#### How We Use Maps
- **Camera Locations**: Show where each camera is positioned
- **Event Visualization**: Display where events occurred
- **Coverage Areas**: Show camera viewing ranges
- **Navigation**: Help security teams navigate to incidents

---

## 🎯 Technology Integration: How It All Works Together

### Request Flow Example: User Logs In
1. **Frontend (React)**: User enters username/password
2. **Frontend→Backend**: HTTP POST to `/api/auth/login`
3. **Backend (Express)**: Validates credentials against MongoDB
4. **Backend→Frontend**: Returns JWT token
5. **Frontend**: Stores token, redirects to dashboard
6. **Frontend**: All future requests include JWT token

### Real-Time Event Flow: AI Detects Person
1. **Camera**: Sends video stream to AI Service
2. **AI Service (Python/YOLO)**: Detects person in frame
3. **AI Service→Backend**: HTTP POST new event data
4. **Backend**: Saves event to MongoDB
5. **Backend**: Broadcasts event via Socket.IO
6. **Frontend**: Receives real-time event, shows alert
7. **Frontend**: Updates dashboard and event list

### Development Workflow
1. **Git**: Clone repository to local machine
2. **Docker**: Start all services with one command
3. **Development**: Make changes to code
4. **Testing**: Verify changes work correctly
5. **Git**: Commit and push changes
6. **Review**: Team reviews code via pull request
7. **Deployment**: Merge to main branch, deploy to production

## 🚀 Getting Started: Next Steps for New Developers

### Prerequisites to Learn
1. **JavaScript/TypeScript Basics**: Variables, functions, objects, arrays
2. **HTML/CSS Fundamentals**: Basic web page structure and styling
3. **Command Line Basics**: Navigate folders, run commands
4. **Git Basics**: Clone, add, commit, push, pull

### Recommended Learning Order
1. **Week 1-2**: JavaScript fundamentals, HTML/CSS basics
2. **Week 3-4**: React basics, component concepts
3. **Week 5-6**: TypeScript, API concepts
4. **Week 7-8**: Node.js, Express basics
5. **Week 9-10**: Database concepts, MongoDB
6. **Week 11-12**: Docker, deployment concepts

### Hands-On Practice
1. **Start Small**: Modify existing components before creating new ones
2. **Use Browser Dev Tools**: Inspect elements, check console for errors
3. **Read Our Code**: Every file has detailed comments explaining what it does
4. **Ask Questions**: Use our team chat for any confusion
5. **Test Changes**: Always verify your changes work before committing

This technology stack represents the modern standard for full-stack web development with AI integration. Each technology was chosen for its learning value, industry relevance, and project suitability. Take time to understand each piece - they all work together to create our complete security monitoring system!