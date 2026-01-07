# Event Monitoring Platform - Beginner Guide

Welcome to the Event Monitoring and Management Platform! This guide will help new team members understand the system architecture, key concepts, and development workflow.

## Table of Contents
1. [System Overview](#system-overview)
2. [Multi-Tenant Architecture](#multi-tenant-architecture)
3. [User Roles and Authentication](#user-roles-and-authentication)
4. [Events vs Reports](#events-vs-reports)
5. [Mobile Integration](#mobile-integration)
6. [Development Workflow](#development-workflow)
7. [Key Technologies](#key-technologies)
8. [Getting Started](#getting-started)

## System Overview

The Event Monitoring Platform is a comprehensive system for detecting, reporting, and managing security and safety incidents. It combines:

- **AI-powered camera detection** for automatic incident identification
- **Mobile citizen reporting** for community engagement
- **First responder coordination** with real-time location tracking
- **Web dashboard** for centralized monitoring and management
- **Multi-tenant architecture** supporting multiple independent organizations

## Multi-Tenant Architecture

The platform uses a **company-based multi-tenant model** where each organization has isolated data and configurations:

### Key Concepts
- **Company**: Top-level tenant with API key authentication
- **API Key**: Unique identifier for mobile app access and company validation
- **Data Isolation**: All data (users, events, cameras) is scoped to specific companies
- **Shared Services**: Global event types and system features available to all companies

### Company Setup
```javascript
// Example company configuration
{
  name: "City Police Department",
  apiKey: "cpd_abc123def456",
  subscription: {
    plan: "professional",
    maxUsers: 50,
    maxCameras: 25
  }
}
```

## User Roles and Authentication

The system supports multiple user types with different authentication methods:

### Web Dashboard Users
- **operator**: Monitors events, manages assignments
- **admin**: User management within company
- **company_admin**: Company-wide settings and billing
- **super_admin**: System-wide company management

*Authentication*: Email + password with JWT tokens

### Mobile Users
- **citizen**: Community reporters via mobile app
- **first_responder**: Emergency personnel with live tracking

*Authentication*: Phone + password for first responders, API key validation for all mobile access

### Authentication Flow
```javascript
// Web login
POST /api/auth/login
{
  email: "operator@company.com",
  password: "securepass"
}

// Mobile access
Headers: X-API-Key: company_api_key
POST /api/mobile/reports
{
  // report data
}
```

## Events vs Reports

Understanding the relationship between events and reports is crucial:

### Reports
- **Individual submissions** from citizens, cameras, or first responders
- **Flexible data entry** - not all fields required
- **Multiple sources** can contribute to the same incident
- **Independent entities** that may or may not create events

### Events
- **Aggregated incidents** built from one or more reports
- **Central coordination point** for response and management
- **Assigned to responders** and tracked through resolution
- **May be created automatically** from high-priority reports

### Relationship Example
```
Report 1 (Citizen): "Suspicious person near park"
Report 2 (Camera): AI detection at same location
Report 3 (First Responder): "On scene, assessing situation"

↓ All linked to ↓

Event: "Suspicious Activity - Central Park"
- Status: Active
- Assigned to: Officer Smith
- Priority: High
```

## Mobile Integration

Mobile apps connect through API key authentication:

### Citizen App
- Browse public event types
- Submit anonymous or authenticated reports
- Include photos, videos, location data
- Receive notifications about local events

### First Responder App
- Phone/password authentication
- Live location tracking during responses
- Access to assigned event details
- Update event status and add reports

### API Key Validation
```javascript
// Every mobile request includes
Headers: {
  'X-API-Key': 'company_specific_api_key'
}

// Backend validates company access
const company = await validateApiKey(req.headers['x-api-key']);
if (!company) throw new ForbiddenError();
```

## Development Workflow

### Project Structure
```
event-monitoring-mvp/
├── backend/           # Node.js/Express API server
├── frontend/          # React dashboard application
├── ai-service/        # Python AI detection service
├── docker/           # Container configurations
└── scripts/          # Database setup and utilities

event-monitoring-mvp-architecture/
└── docs/            # Architecture documentation
```

### Development Setup
1. **Clone repositories**
2. **Install dependencies**: `npm install` in backend/frontend
3. **Environment setup**: Copy `.env.example` to `.env`
4. **Database**: Run `npm run setup-db` to initialize MongoDB
5. **Start services**: `docker-compose up` for full stack

### Key Scripts
```bash
# Backend development
npm run dev          # Start with hot reload
npm run build        # Production build
npm run test         # Run test suite

# Database management
npm run setup-db     # Initialize database
npm run seed-db      # Add sample data

# Docker operations
docker-compose up    # Start all services
docker-compose down  # Stop services
```

## Key Technologies

### Backend
- **Node.js + Express**: RESTful API server
- **TypeScript**: Type-safe development
- **MongoDB + Mongoose**: Document database with schemas
- **JWT**: Authentication tokens
- **WebSocket**: Real-time updates

### Frontend
- **React + TypeScript**: Component-based UI
- **Redux**: State management
- **Leaflet**: Interactive maps
- **Material-UI**: Component library

### AI Service
- **Python + FastAPI**: ML service API
- **YOLOv8**: Object detection
- **OpenCV**: Computer vision processing

### Infrastructure
- **Docker**: Containerized deployment
- **Nginx**: Reverse proxy and load balancing
- **MongoDB**: Primary database
- **Redis**: Caching and session storage

## Getting Started

### 1. Environment Setup
```bash
# Install Node.js 18+, Python 3.9+, Docker

# Clone the project
git clone <repository-url>
cd event-monitoring-mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install AI service dependencies
cd ../ai-service
pip install -r requirements.txt
```

### 2. Configuration
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your settings
# - Database connection strings
# - JWT secrets
# - API keys
# - Service URLs
```

### 3. Database Setup
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Initialize database schema
cd backend
npm run setup-db

# Optional: Add sample data
npm run seed-db
```

### 4. Running the Application
```bash
# Start all services
docker-compose up -d

# Or run individually
cd backend && npm run dev
cd frontend && npm start
cd ai-service && python main.py
```

### 5. Testing
```bash
# API tests
cd backend
npm test

# Mobile API testing
# Use tools like Postman or curl with X-API-Key header

# Example API call
curl -X POST http://localhost:3000/api/mobile/reports \
  -H "X-API-Key: your_company_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "citizen",
    "title": "Test Report",
    "description": "Testing mobile integration",
    "eventTypeId": "...",
    "location": {
      "type": "Point",
      "coordinates": [-118.2437, 34.0522]
    }
  }'
```

## Common Tasks

### Adding a New Event Type
1. Use admin dashboard or API to create event type
2. Set category, priority, and public visibility
3. Configure auto-creation rules if needed
4. Test with mobile app submission

### Setting Up a New Company
1. Create company via super_admin API
2. Note the generated API key
3. Configure company settings and subscription
4. Create initial admin user
5. Provide API key to mobile app developers

### Troubleshooting
- **API Key Issues**: Verify X-API-Key header is present and valid
- **Database Connection**: Check MongoDB is running and connection string
- **CORS Errors**: Ensure frontend URL is in allowed origins
- **WebSocket Issues**: Check firewall settings for port 8080

## Next Steps

1. **Read the Architecture Docs**: Deep dive into [system architecture](docs/architecture/)
2. **Explore the API**: Review [backend endpoints](docs/api/backend_endpoints.md)
3. **Understand Data Models**: Check [data model documentation](docs/data-models/)
4. **Join Team Coordination**: Follow the [team coordination protocol](../team-coordination-protocol.md)

Welcome aboard! The Event Monitoring Platform is a complex but rewarding system to work with. Don't hesitate to ask questions and contribute to our growing codebase.