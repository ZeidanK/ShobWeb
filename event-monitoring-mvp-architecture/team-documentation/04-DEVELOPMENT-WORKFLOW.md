# Development Workflow & Best Practices

## 🚀 Getting Started: Your First Day

### **Prerequisites Setup Checklist**
Before you can start developing, ensure you have these tools installed:

#### Required Software
- [ ] **Node.js** (v18+) - [Download here](https://nodejs.org/)
- [ ] **Python** (v3.9+) - [Download here](https://python.org/)
- [ ] **Docker Desktop** - [Download here](https://docker.com/products/docker-desktop/)
- [ ] **Git** - [Download here](https://git-scm.com/)
- [ ] **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

#### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-azuretools.vscode-docker"
  ]
}
```

### **Repository Setup**
```bash
# 1. Clone the repository
git clone https://github.com/your-team/event-monitoring-mvp.git
cd event-monitoring-mvp

# 2. Checkout your feature branch
git checkout -b feature/your-name-first-task

# 3. Install dependencies (all services)
npm run install-all

# 4. Start the development environment
docker-compose up --build
```

### **Environment Configuration**
Create environment files for each service:

#### **Backend Environment** (`.env`)
```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017/eventmonitoring_dev
MONGO_TEST_URL=mongodb://localhost:27017/eventmonitoring_test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# External Services
MAPBOX_API_KEY=your-mapbox-api-key
EMAIL_SERVICE_URL=http://localhost:8001
SMS_SERVICE_URL=http://localhost:8002

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key
```

#### **Frontend Environment** (`.env`)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# External Services
REACT_APP_MAPBOX_TOKEN=your-mapbox-token

# Development Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
```

#### **AI Service Environment** (`.env`)
```bash
# Service Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Model Configuration
MODEL_PATH=/app/models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
DEVICE=cpu  # or 'cuda' if you have GPU

# Backend Integration
BACKEND_URL=http://backend:5000
API_KEY=your-ai-service-api-key
```

## 🔄 Development Workflow

### **Branch Strategy: GitFlow Simplified**

#### **Branch Types**
- **`main`** - Production-ready code only
- **`develop`** - Latest development integration
- **`feature/task-description`** - New features
- **`bugfix/issue-description`** - Bug fixes
- **`hotfix/critical-issue`** - Emergency production fixes

#### **Workflow Steps**
```bash
# 1. Start with latest develop branch
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/add-camera-alerts

# 3. Work on your changes
# ... make changes to code ...

# 4. Test your changes locally
npm test
docker-compose up --build

# 5. Commit with descriptive messages
git add .
git commit -m "feat: add real-time camera offline alerts

- Add Socket.IO listener for camera status changes
- Update dashboard to show offline camera notifications
- Add red indicator for offline cameras in camera list
- Include unit tests for new notification system"

# 6. Push to GitHub
git push origin feature/add-camera-alerts

# 7. Create Pull Request on GitHub
# 8. Request code review from team members
# 9. Address review feedback if needed
# 10. Merge after approval
```

### **Commit Message Convention**
We follow [Conventional Commits](https://conventionalcommits.org/) for clear commit history:

```bash
# Format: type(scope): description
#
# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, no logic change)
refactor: # Code refactoring (no new features or bug fixes)
test:     # Adding or updating tests
chore:    # Build process or auxiliary tool changes

# Examples:
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(cameras): resolve stream connection timeout issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(events): add unit tests for event filtering"
```

## 🧪 Testing Strategy

### **Testing Pyramid**

#### **Unit Tests** (70% of tests)
Test individual functions and components:

```javascript
// Example: Backend unit test
describe('User Authentication', () => {
  test('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    
    expect(hashedPassword).not.toBe(password);
    expect(await comparePassword(password, hashedPassword)).toBe(true);
  });
  
  test('should generate valid JWT token', () => {
    const user = { id: '123', role: 'guard' };
    const token = generateToken(user);
    const decoded = verifyToken(token);
    
    expect(decoded.id).toBe(user.id);
    expect(decoded.role).toBe(user.role);
  });
});
```

```javascript
// Example: Frontend unit test
describe('CameraCard Component', () => {
  test('renders camera information correctly', () => {
    const mockCamera = {
      id: '1',
      name: 'Main Entrance',
      status: 'online',
      location: 'Building A'
    };
    
    render(<CameraCard camera={mockCamera} />);
    
    expect(screen.getByText('Main Entrance')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('Building A')).toBeInTheDocument();
  });
});
```

#### **Integration Tests** (20% of tests)
Test how services work together:

```javascript
// Example: API integration test
describe('Camera API Integration', () => {
  test('should create and retrieve camera', async () => {
    const cameraData = {
      name: 'Test Camera',
      streamUrl: 'rtsp://test.camera.com',
      location: { lat: 40.7128, lng: -74.0060 }
    };
    
    // Create camera
    const createResponse = await request(app)
      .post('/api/cameras')
      .set('Authorization', `Bearer ${authToken}`)
      .send(cameraData)
      .expect(201);
      
    const cameraId = createResponse.body.id;
    
    // Retrieve camera
    const getResponse = await request(app)
      .get(`/api/cameras/${cameraId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
      
    expect(getResponse.body.name).toBe(cameraData.name);
    expect(getResponse.body.streamUrl).toBe(cameraData.streamUrl);
  });
});
```

#### **End-to-End Tests** (10% of tests)
Test complete user workflows:

```javascript
// Example: E2E test with Playwright
test('user can login and view dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="username"]', 'testuser');
  await page.fill('[data-testid="password"]', 'testpass');
  await page.click('[data-testid="login-button"]');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  
  // Verify camera count is displayed
  await expect(page.locator('[data-testid="camera-count"]')).toBeVisible();
});
```

### **Running Tests**

#### **All Services**
```bash
# Run all tests across all services
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

#### **Individual Services**
```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage

# AI Service tests
cd ai-service
python -m pytest
python -m pytest --cov=src
```

## 🔍 Code Review Process

### **Pull Request Template**
Every PR should include:

```markdown
## Description
Brief description of changes and motivation

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
Include before/after screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log or debug code left behind
```

### **Review Checklist for Reviewers**

#### **Code Quality**
- [ ] Code follows established patterns and conventions
- [ ] Functions are small and focused (single responsibility)
- [ ] Variable and function names are descriptive
- [ ] No code duplication (DRY principle)
- [ ] Error handling is comprehensive
- [ ] Security considerations are addressed

#### **Functionality**
- [ ] Feature works as described
- [ ] Edge cases are handled
- [ ] No obvious bugs or logical errors
- [ ] Performance implications considered
- [ ] Backward compatibility maintained

#### **Testing**
- [ ] Adequate test coverage
- [ ] Tests are meaningful and test the right things
- [ ] All tests pass
- [ ] No test flakiness

#### **Documentation**
- [ ] Code is self-documenting with good naming
- [ ] Complex logic is commented
- [ ] API changes are documented
- [ ] README updated if needed

## 🔧 Development Tools & Scripts

### **Package.json Scripts**

#### **Root Package.json**
```json
{
  "scripts": {
    "install-all": "npm install && cd frontend && npm install && cd ../backend && npm install && cd ../ai-service && pip install -r requirements.txt",
    "dev": "docker-compose up --build",
    "dev:services": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" \"npm run dev:ai\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run start",
    "dev:ai": "cd ai-service && python -m uvicorn app:app --reload --port 8000",
    "test:all": "npm run test:backend && npm run test:frontend && npm run test:ai",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test -- --coverage --verbose",
    "test:ai": "cd ai-service && python -m pytest",
    "lint:all": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint",
    "build:all": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "db:seed": "cd backend && npm run db:seed",
    "db:reset": "cd backend && npm run db:reset"
  }
}
```

### **Development Shortcuts**

#### **VS Code Tasks** (`.vscode/tasks.json`)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Environment",
      "type": "shell",
      "command": "docker-compose up --build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Run All Tests",
      "type": "shell",
      "command": "npm run test:all",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

#### **Makefile Shortcuts**
```makefile
# Quick development commands
.PHONY: dev test clean install

dev:
	docker-compose up --build

test:
	npm run test:all

clean:
	docker-compose down -v
	docker system prune -f

install:
	npm run install-all

seed:
	npm run db:seed

logs:
	docker-compose logs -f

restart:
	docker-compose restart

# Database operations
db-reset:
	docker-compose down -v
	docker-compose up -d mongo
	sleep 5
	npm run db:seed

# Production builds
build:
	npm run build:all
	docker-compose build

# Linting and formatting
lint:
	npm run lint:all

format:
	npm run format:all
```

## 🐛 Debugging Guide

### **Common Issues & Solutions**

#### **Frontend Issues**

**Issue: "Module not found" errors**
```bash
# Solution: Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Issue: TypeScript errors**
```bash
# Solution: Check types and restart TypeScript service
npm run type-check
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**Issue: Socket.IO connection failed**
```javascript
// Check backend is running and Socket.IO configuration
// Frontend: src/services/socket.ts
const socket = io('http://localhost:5000', {
  autoConnect: false,
  timeout: 20000,
});

// Backend: app.ts
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
```

#### **Backend Issues**

**Issue: MongoDB connection failed**
```bash
# Solution: Ensure MongoDB is running
docker-compose up mongo
# Or locally:
mongod --dbpath /usr/local/var/mongodb
```

**Issue: JWT token errors**
```javascript
// Check JWT_SECRET is set in environment
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Verify token format in frontend
const token = localStorage.getItem('token');
console.log('Token format:', token?.startsWith('Bearer ') ? 'Correct' : 'Missing Bearer prefix');
```

#### **AI Service Issues**

**Issue: Python dependencies missing**
```bash
# Solution: Reinstall requirements
cd ai-service
pip install -r requirements.txt
# Or with virtual environment:
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Issue: YOLO model not loading**
```python
# Check model file exists
import os
model_path = '/app/models/yolov8n.pt'
print(f"Model exists: {os.path.exists(model_path)}")

# Download model if missing
from ultralytics import YOLO
model = YOLO('yolov8n.pt')  # Auto-downloads if not present
```

### **Debugging Tools**

#### **Browser DevTools**
```javascript
// Frontend debugging helpers
console.log('Redux State:', store.getState());
console.log('Socket connected:', socket.connected);

// Network tab: Check API requests
// Console tab: Check for JavaScript errors
// Application tab: Check localStorage and cookies
```

#### **Backend Debugging**
```javascript
// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers,
    user: req.userId
  });
  next();
});

// Debug database queries
mongoose.set('debug', process.env.NODE_ENV === 'development');
```

#### **Docker Debugging**
```bash
# View container logs
docker-compose logs -f [service-name]

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec mongo mongo

# Check container resource usage
docker stats

# Rebuild specific service
docker-compose build [service-name]
docker-compose up [service-name]
```

## 📊 Performance Monitoring

### **Development Metrics**

#### **Frontend Performance**
```javascript
// React DevTools Profiler
// Chrome DevTools Lighthouse
// Bundle analyzer
npm run analyze

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

#### **Backend Performance**
```javascript
// API response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});

// Database query performance
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
```

## 🎯 Success Metrics

### **Development Quality Metrics**
- **Code Coverage**: >80% for all services
- **Build Time**: <5 minutes for full build
- **Test Execution**: <2 minutes for all unit tests
- **PR Review Time**: <24 hours average
- **Bug Rate**: <1 bug per 100 lines of code

### **Performance Targets**
- **Frontend Load Time**: <2 seconds initial load
- **API Response Time**: <200ms average
- **Real-time Latency**: <100ms for Socket.IO events
- **Database Query Time**: <50ms average
- **AI Processing**: <500ms per frame

This development workflow ensures consistent, high-quality code delivery while maintaining team productivity and code maintainability. Following these practices will help new team members quickly become productive contributors to the project!