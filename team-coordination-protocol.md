# SHOB Web - Team Coordination Protocol
## Real-Time Event Monitoring System Development Guide

### Document Purpose
This document provides comprehensive recommendations and protocols for coordinating development between the Web Team and Mobile Team to ensure seamless integration, data consistency, and avoid mismatches in the real-time event monitoring system.

---

## 1. PROJECT OVERVIEW & SCOPE

### System Architecture Overview
- **Web Team**: Building the main dashboard, operator interface, and backend services
- **Mobile Team**: Building mobile app for field users to report events and for operators to manage events
- **Shared Components**: Backend API, Database, AI Analysis Engine, Real-time communication

### Key Integration Points
1. **Event Data Management**: Both teams handle event creation, updates, and viewing
2. **Real-time Communication**: WebSocket connections for live updates
3. **User Management**: Authentication and role-based access control
4. **Video & Media Handling**: Streaming and file management
5. **GIS & Location Services**: Map integration and geofencing

---

## 2. STANDARDIZED DATA MODELS

### 2.1 Event Data Structure
```json
{
  "_id": "ObjectId",
  "type": "enum: ['motion', 'face', 'lpr', 'object', 'manual', 'geofence', 'emergency']",
  "subType": "enum: ['suspicious_activity', 'abandoned_object', 'unauthorized_access', 'vehicle_detection', 'crowd_detection', 'manual_report']",
  "severity": "number: 1-5 (1=low, 5=critical)",
  "status": "enum: ['open', 'in_progress', 'resolved', 'closed', 'false_positive']",
  "title": "string: required, max 100 characters",
  "description": "string: optional, max 1000 characters",
  "reportedBy": {
    "userId": "ObjectId",
    "userType": "enum: ['web_operator', 'mobile_user', 'ai_system']",
    "userName": "string",
    "timestamp": "Date"
  },
  "location": {
    "latitude": "number: required",
    "longitude": "number: required",
    "accuracy": "number: meters",
    "address": "string: optional"
  },
  "cameraIds": ["ObjectId array: optional"],
  "videoStreams": [{
    "streamId": "ObjectId",
    "startTime": "Date",
    "endTime": "Date",
    "filePath": "string"
  }],
  "attachments": [{
    "type": "enum: ['image', 'video', 'audio', 'document']",
    "filePath": "string",
    "fileName": "string",
    "fileSize": "number",
    "uploadedBy": "ObjectId",
    "uploadedAt": "Date"
  }],
  "aiAnalysis": {
    "confidence": "number: 0-1",
    "detectedObjects": ["array of objects"],
    "processedAt": "Date"
  },
  "timeline": [{
    "action": "enum: ['created', 'updated', 'status_changed', 'assigned', 'commented']",
    "performedBy": "ObjectId",
    "timestamp": "Date",
    "details": "object",
    "comment": "string: optional"
  }],
  "assignedTo": "ObjectId: optional",
  "tags": ["string array: optional"],
  "priority": "enum: ['low', 'medium', 'high', 'critical']",
  "createdAt": "Date: auto-generated",
  "updatedAt": "Date: auto-generated",
  "resolvedAt": "Date: optional"
}
```

### 2.2 User Data Structure
```json
{
  "_id": "ObjectId",
  "email": "string: unique, required",
  "passwordHash": "string: required",
  "fullName": "string: required",
  "role": "enum: ['admin', 'operator', 'field_user', 'viewer']",
  "permissions": {
    "canCreateEvents": "boolean",
    "canUpdateEvents": "boolean",
    "canDeleteEvents": "boolean",
    "canViewAllEvents": "boolean",
    "canManageUsers": "boolean",
    "canAccessAnalytics": "boolean"
  },
  "profile": {
    "phoneNumber": "string: optional",
    "department": "string: optional",
    "location": "string: optional",
    "avatar": "string: optional"
  },
  "isActive": "boolean: default true",
  "lastLogin": "Date: optional",
  "createdAt": "Date: auto-generated"
}
```

### 2.3 Camera Data Structure
```json
{
  "_id": "ObjectId",
  "name": "string: required",
  "type": "enum: ['IP', 'VMS', 'IoT', 'Mobile']",
  "streamUrl": "string: required",
  "location": {
    "latitude": "number: required",
    "longitude": "number: required",
    "address": "string: optional"
  },
  "status": "enum: ['active', 'inactive', 'maintenance']",
  "capabilities": {
    "hasAudio": "boolean",
    "resolution": "string",
    "nightVision": "boolean",
    "ptzControl": "boolean"
  },
  "createdAt": "Date: auto-generated"
}
```

---

## 3. API SPECIFICATION & ENDPOINTS

### 3.1 Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/change-password
```

### 3.2 Event Management Endpoints
```
GET    /api/events                    # Get events with filters
POST   /api/events                    # Create new event
GET    /api/events/:id                # Get specific event
PUT    /api/events/:id                # Update event
DELETE /api/events/:id                # Delete event
POST   /api/events/:id/comments       # Add comment to event
PUT    /api/events/:id/status         # Update event status
POST   /api/events/:id/assign         # Assign event to user
GET    /api/events/:id/timeline       # Get event timeline
POST   /api/events/:id/attachments    # Upload attachment
```

### 3.3 Real-time Communication Endpoints
```
WebSocket: /ws/events                 # Real-time event updates
WebSocket: /ws/notifications          # User notifications
WebSocket: /ws/video-stream/:cameraId # Live video stream
```

### 3.4 Media & File Management
```
POST /api/media/upload               # Upload files
GET  /api/media/:id                  # Get file
DELETE /api/media/:id                # Delete file
POST /api/media/bulk-upload          # Bulk upload
```

### 3.5 Camera & Video Endpoints
```
GET /api/cameras                     # Get available cameras
GET /api/cameras/:id                 # Get camera details
GET /api/cameras/:id/stream          # Get live stream
GET /api/cameras/:id/recordings      # Get historical recordings
```

---

## 4. REAL-TIME COMMUNICATION PROTOCOLS

### 4.1 WebSocket Event Types
```javascript
// Event Updates
{
  "type": "EVENT_CREATED",
  "payload": { /* event object */ }
}

{
  "type": "EVENT_UPDATED", 
  "payload": { 
    "eventId": "string",
    "changes": { /* changed fields */ }
  }
}

{
  "type": "EVENT_STATUS_CHANGED",
  "payload": {
    "eventId": "string",
    "oldStatus": "string",
    "newStatus": "string",
    "changedBy": "ObjectId"
  }
}

// Notifications
{
  "type": "NOTIFICATION",
  "payload": {
    "severity": "enum: ['info', 'warning', 'error', 'critical']",
    "message": "string",
    "eventId": "string: optional",
    "timestamp": "Date"
  }
}
```

### 4.2 Connection Management
- **Authentication**: JWT token required for WebSocket connections
- **Reconnection Logic**: Implement exponential backoff
- **Heartbeat**: Ping/pong every 30 seconds
- **Message Queuing**: Store missed messages for offline users

---

## 5. DEVELOPMENT WORKFLOW RECOMMENDATIONS

### 5.1 Phase 1: Foundation Setup (Week 1-2)
**Both Teams:**
1. Set up shared development environment
2. Implement basic authentication system
3. Create database schema and seed data
4. Set up API documentation (Swagger/OpenAPI)
5. Establish CI/CD pipeline

**Web Team Focus:**
- Backend API structure
- Database setup and migrations
- Basic authentication middleware

**Mobile Team Focus:**
- Project setup and navigation structure
- API client configuration
- Authentication flow implementation

### 5.2 Phase 2: Core Event Management (Week 3-4)
**Both Teams:**
1. Implement event CRUD operations
2. Set up real-time communication
3. Basic event listing and filtering
4. Event status management

**Shared Responsibilities:**
- API endpoint testing
- WebSocket connection testing
- Data validation rules

### 5.3 Phase 3: Advanced Features (Week 5-6)
**Web Team:**
- Dashboard with analytics
- Video streaming integration
- Map visualization with events
- Admin panel

**Mobile Team:**
- Event reporting with media upload
- Push notifications
- Offline capability
- Location services integration

### 5.4 Phase 4: Integration & Testing (Week 7-8)
**Both Teams:**
- End-to-end testing
- Performance optimization
- Real-time synchronization testing
- User acceptance testing

---

## 6. COMMUNICATION PROTOCOLS

### 6.1 Daily Coordination
- **Daily Standup**: Joint 15-min meeting at 9:00 AM
- **API Changes**: 24-hour notice before breaking changes
- **Database Migrations**: Coordinate before deployment
- **Shared Documentation**: Update API docs immediately after changes

### 6.2 Code Review Process
1. **Cross-team Reviews**: Each team reviews API changes from the other
2. **Breaking Changes**: Require approval from both team leads
3. **Documentation**: Update API docs with every PR
4. **Testing**: Include integration tests for shared endpoints

### 6.3 Issue Tracking
- **Shared Project Board**: Use GitHub Projects or Jira
- **Label System**:
  - `api-change`: API modifications
  - `breaking-change`: Breaking changes
  - `mobile-impact`: Changes affecting mobile
  - `web-impact`: Changes affecting web
  - `real-time`: Real-time communication issues

---

## 7. DATA VALIDATION & CONSTRAINTS

### 7.1 Event Validation Rules
```javascript
const eventValidation = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.]+$/
  },
  description: {
    maxLength: 1000
  },
  severity: {
    required: true,
    min: 1,
    max: 5
  },
  location: {
    latitude: { min: -90, max: 90 },
    longitude: { min: -180, max: 180 }
  },
  attachments: {
    maxFiles: 10,
    maxFileSize: "10MB",
    allowedTypes: ["image/jpeg", "image/png", "video/mp4", "audio/mp3"]
  }
}
```

### 7.2 Error Handling Standards
```javascript
// Standard Error Response Format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  },
  "timestamp": "2025-12-16T10:00:00Z"
}
```

---

## 8. TESTING STRATEGIES

### 8.1 Integration Testing
- **API Testing**: Shared Postman collection
- **Real-time Testing**: WebSocket connection tests
- **Database Testing**: Shared test database
- **End-to-end Testing**: User journey tests

### 8.2 Mock Data Standards
```javascript
// Shared test data structure
const mockEvents = {
  emergency: {
    type: "emergency",
    severity: 5,
    status: "open",
    title: "Emergency Situation",
    location: { latitude: 32.0853, longitude: 34.7818 }
  },
  routine: {
    type: "manual", 
    severity: 2,
    status: "open",
    title: "Routine Check",
    location: { latitude: 32.0853, longitude: 34.7818 }
  }
}
```

---

## 9. DEPLOYMENT & ENVIRONMENT MANAGEMENT

### 9.1 Environment Strategy
- **Development**: Shared staging server
- **Testing**: Isolated testing environment 
- **Production**: Coordinated deployment schedule

### 9.2 Environment Configuration
```yaml
# Shared environment variables
DATABASE_URL: "mongodb://localhost:27017/shob_web"
JWT_SECRET: "shared_secret_key"
WEBSOCKET_PORT: 3001
API_BASE_URL: "http://localhost:3000/api"
MEDIA_UPLOAD_PATH: "/uploads"
MAX_FILE_SIZE: "10MB"
```

---

## 10. SECURITY CONSIDERATIONS

### 10.1 Authentication & Authorization
- **JWT Tokens**: 24-hour expiration with refresh tokens
- **Role-Based Access**: Consistent permission checking
- **API Rate Limiting**: Prevent abuse
- **File Upload Security**: Virus scanning and type validation

### 10.2 Data Security
- **Input Sanitization**: XSS and SQL injection prevention
- **HTTPS Only**: All communication encrypted
- **Media Security**: Secure file storage with access controls
- **Audit Logging**: Track all data modifications

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Database Optimization
```javascript
// Recommended indexes
db.events.createIndex({ "location": "2dsphere" })
db.events.createIndex({ "createdAt": -1 })
db.events.createIndex({ "status": 1, "severity": -1 })
db.events.createIndex({ "assignedTo": 1 })
```

### 11.2 Real-time Performance
- **Connection Pooling**: Limit WebSocket connections
- **Message Throttling**: Rate limit real-time updates
- **Data Pagination**: Limit API response sizes
- **Caching Strategy**: Redis for frequently accessed data

---

## 12. MONITORING & LOGGING

### 12.1 Application Monitoring
- **API Response Times**: Track endpoint performance
- **Error Rates**: Monitor and alert on failures
- **WebSocket Health**: Connection stability metrics
- **Database Performance**: Query execution times

### 12.2 Business Metrics
- **Event Creation Rate**: Monitor system usage
- **Response Times**: Track operator efficiency
- **User Activity**: Monitor engagement patterns

---

## 13. EMERGENCY PROCEDURES

### 13.1 Critical Issues Response
1. **Immediate Communication**: Slack/Teams emergency channel
2. **Rollback Procedures**: Automated rollback capability
3. **Data Recovery**: Backup and restore procedures
4. **Escalation Path**: Clear responsibility hierarchy

### 13.2 System Maintenance
- **Maintenance Windows**: Coordinated downtime
- **Database Updates**: Staged migration process
- **API Versioning**: Backward compatibility strategy

---

## 14. SUCCESS METRICS & MILESTONES

### 14.1 Technical Milestones
- [ ] Authentication system integration complete
- [ ] Real-time event synchronization working
- [ ] File upload/download functioning
- [ ] WebSocket stability achieved (99% uptime)
- [ ] API response times under 200ms

### 14.2 User Experience Metrics
- [ ] Event creation time under 30 seconds
- [ ] Real-time updates delivered within 2 seconds
- [ ] Cross-platform data consistency achieved
- [ ] Zero data loss during synchronization

---

## 15. NEXT STEPS & ACTION ITEMS

### Immediate Actions (This Week)
1. **Both Teams**: Review and approve this protocol document
2. **Web Team**: Set up shared development database
3. **Mobile Team**: Configure API client with agreed endpoints
4. **Both Teams**: Set up shared communication channels
5. **Both Teams**: Create initial API documentation

### Week 1 Goals
1. Complete authentication system integration
2. Implement basic event CRUD operations
3. Set up real-time communication infrastructure
4. Establish testing environment and procedures

### Communication Schedule
- **Monday**: Joint planning meeting (1 hour)
- **Wednesday**: Technical sync meeting (30 minutes)  
- **Friday**: Progress review and blocker resolution (30 minutes)
- **Ad-hoc**: Emergency communication as needed

---

**Document Version**: 1.0  
**Last Updated**: December 16, 2025  
**Next Review**: Weekly during development

This protocol should be treated as a living document and updated based on learnings and changes during development.