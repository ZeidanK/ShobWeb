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
  "title": "string: required, 3-200 characters",
  "description": "string: optional, max 2000 characters",
  "type": "enum: ['security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 'user_report', 'system_alert', 'motion_detected', 'person_detected', 'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other']",
  "severity": "enum: ['low', 'medium', 'high', 'critical', 'emergency']",
  "priority": "number: 1-5 (1=highest, 5=lowest)",
  "status": "enum: ['pending', 'acknowledged', 'investigating', 'resolved', 'closed', 'dismissed']",
  "cameraId": "ObjectId: optional (not required for user reports)",
  "detectionId": "ObjectId: optional (link to original AI detection)",
  "location": {
    "type": "Point",
    "coordinates": "[longitude, latitude]",
    "address": "string: optional",
    "accuracy": "number: GPS accuracy in meters"
  },
  "detectionData": {
    "confidence": "number: 0-1",
    "boundingBox": "object: detection coordinates",
    "detectedObjects": ["array of detected objects"],
    "aiModel": "string: model used for detection",
    "detectionTimestamp": "Date"
  },
  "media": {
    "images": ["array of image URLs"],
    "videos": ["array of video URLs"],
    "thumbnails": ["array of thumbnail URLs"],
    "attachments": [{
      "fileName": "string",
      "fileUrl": "string",
      "fileType": "string",
      "fileSize": "number",
      "uploadedAt": "Date"
    }]
  },
  "reporter": {
    "userId": "ObjectId: optional (for registered users)",
    "name": "string: optional (for anonymous reports)",
    "email": "string: optional",
    "phone": "string: optional",
    "isAnonymous": "boolean: default false"
  },
  "assignedTo": "ObjectId: optional",
  "escalatedTo": "ObjectId: optional",
  "acknowledgedAt": "Date: optional",
  "resolvedAt": "Date: optional",
  "estimatedResolutionTime": "Date: optional",
  "actualResolutionTime": "Date: optional",
  "notes": [{
    "content": "string",
    "author": "ObjectId",
    "timestamp": "Date",
    "noteType": "enum: ['general', 'investigation', 'resolution', 'escalation']",
    "isInternal": "boolean"
  }],
  "tags": ["string array"],
  "customFields": "Map<string, any>: flexible custom data",
  "source": "enum: ['camera_system', 'user_report', 'ai_detection', 'sensor_alert', 'manual_entry', 'mobile_app']",
  "verified": "boolean: operator verification status",
  "publiclyVisible": "boolean: visible in public feeds",
  "resolution": {
    "summary": "string: optional",
    "actions": ["array of resolution actions"],
    "preventiveMeasures": ["array of preventive measures"],
    "followUpRequired": "boolean",
    "satisfactionRating": "number: 1-5 (if applicable)"
  },
  "workflow": [{
    "status": "string",
    "timestamp": "Date",
    "userId": "ObjectId",
    "notes": "string: optional"
  }],
  "createdAt": "Date: auto-generated",
  "updatedAt": "Date: auto-generated"
}
```

### 2.2 User Data Structure
```json
{
  "_id": "ObjectId",
  "username": "string: unique, required",
  "email": "string: unique, required for email auth",
  "passwordHash": "string: required for email auth",
  "phone": "string: required for phone auth",
  "fullName": "string: required",
  "role": "enum: ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin']",
  "authMethod": "enum: ['email_password', 'phone_otp', 'social_oauth']",
  "permissions": {
    "granted": ["ObjectId array: individual permissions"],
    "inherited": ["ObjectId array: role-based permissions"]
  },
  "profile": {
    "phoneNumber": "string: optional",
    "department": "string: optional",
    "location": "string: optional",
    "avatar": "string: optional",
    "bio": "string: optional",
    "timezone": "string: optional"
  },
  "mobileSettings": {
    "deviceTokens": ["array of push notification tokens"],
    "notificationPreferences": {
      "pushEnabled": "boolean",
      "emailEnabled": "boolean",
      "smsEnabled": "boolean",
      "eventTypes": ["array of event types to receive notifications for"]
    },
    "locationSharing": "boolean"
  },
  "verification": {
    "isVerified": "boolean",
    "verificationMethod": "enum: ['email', 'phone', 'manual']",
    "verifiedAt": "Date: optional",
    "verifiedBy": "ObjectId: optional"
  },
  "isActive": "boolean: default true",
  "lastLogin": "Date: optional",
  "loginAttempts": "number: failed login tracking",
  "lockedUntil": "Date: optional account lock",
  "createdAt": "Date: auto-generated",
  "updatedAt": "Date: auto-generated"
}
```

### 2.3 EventType Data Structure
```json
{
  "_id": "ObjectId",
  "name": "string: unique, required",
  "category": "enum: ['security', 'traffic', 'emergency', 'maintenance', 'social', 'environmental']",
  "parentType": "ObjectId: optional (for hierarchical types/subtypes)",
  "isPublic": "boolean: available for citizen reporters",
  "allowedRoles": ["array of roles that can use this type"],
  "defaultSeverity": "enum: ['low', 'medium', 'high', 'critical', 'emergency']",
  "defaultPriority": "number: 1-5",
  "requiredFields": ["array of required field names"],
  "autoAssignmentRules": {
    "location": {
      "type": "Point",
      "coordinates": ["longitude", "latitude"],
      "radius": "number: meters"
    },
    "assignTo": "ObjectId: user to auto-assign to"
  },
  "escalationRules": {
    "timeThreshold": "number: minutes before escalation",
    "escalateTo": "ObjectId: user to escalate to"
  },
  "notificationSettings": {
    "immediateNotification": "boolean",
    "notificationChannels": ["array: ['push', 'email', 'sms']"],
    "recipientGroups": ["array of user groups to notify"]
  },
  "validationRules": {
    "requiresMedia": "boolean",
    "requiresLocation": "boolean",
    "requiresApproval": "boolean",
    "minimumSeverity": "string: optional"
  },
  "isActive": "boolean: default true",
  "createdAt": "Date: auto-generated",
  "updatedAt": "Date: auto-generated"
}
```

### 2.4 Camera Data Structure
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
POST /api/auth/login              # Email/password login
POST /api/auth/logout             # Standard logout
POST /api/auth/refresh            # Refresh JWT token
GET  /api/auth/profile            # Get user profile
PUT  /api/auth/profile            # Update user profile
POST /api/auth/change-password    # Change password

# Mobile Authentication
POST /api/mobile/auth/phone-verify     # Send OTP to phone
POST /api/mobile/auth/phone-confirm    # Confirm OTP
POST /api/mobile/auth/anonymous        # Anonymous session
POST /api/mobile/auth/social           # Social login (Google/Apple)
```

### 3.2 Event Management Endpoints
```
# Standard Event Operations
GET    /api/events                    # Get events with filters
POST   /api/events                    # Create new event (with validation)
GET    /api/events/:id                # Get specific event
PUT    /api/events/:id                # Update event
DELETE /api/events/:id                # Delete event
POST   /api/events/:id/comments       # Add comment/note to event
PUT    /api/events/:id/status         # Update event status
POST   /api/events/:id/assign         # Assign event to user
POST   /api/events/:id/escalate       # Escalate event
GET    /api/events/:id/timeline       # Get event workflow timeline
POST   /api/events/:id/attachments    # Upload media attachments
GET    /api/events/:id/attachments    # Get event attachments
POST   /api/events/:id/verify         # Verify/approve event

# Mobile Event Operations  
GET    /api/mobile/events/my          # User's submitted events
POST   /api/mobile/events             # Citizen event reporting
GET    /api/mobile/events/nearby      # Events near user location
POST   /api/mobile/events/:id/follow  # Follow event updates
```

### 3.3 EventType Management Endpoints
```
GET    /api/event-types               # Get all event types
POST   /api/event-types               # Create new event type (admin)
GET    /api/event-types/:id           # Get specific event type
PUT    /api/event-types/:id           # Update event type
DELETE /api/event-types/:id           # Delete event type
GET    /api/event-types/public        # Public event types for citizens
GET    /api/event-types/hierarchy     # Get type hierarchy

# Mobile EventType Operations
GET    /api/mobile/event-types        # Public event types for mobile
GET    /api/mobile/event-types/:id    # Get mobile-optimized type details
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
  "payload": {
    "event": { /* enhanced event object */ },
    "source": "mobile_app | web_dashboard | ai_system",
    "requiresApproval": "boolean"
  }
}

{
  "type": "EVENT_UPDATED", 
  "payload": { 
    "eventId": "string",
    "changes": { /* changed fields with old/new values */ },
    "updatedBy": "ObjectId",
    "timestamp": "Date"
  }
}

{
  "type": "EVENT_STATUS_CHANGED",
  "payload": {
    "eventId": "string",
    "oldStatus": "string",
    "newStatus": "string",
    "changedBy": "ObjectId",
    "workflowStep": "object",
    "estimatedResolution": "Date: optional"
  }
}

{
  "type": "EVENT_ASSIGNED",
  "payload": {
    "eventId": "string",
    "assignedTo": "ObjectId",
    "assignedBy": "ObjectId",
    "priority": "number",
    "dueDate": "Date: optional"
  }
}

{
  "type": "EVENT_ESCALATED",
  "payload": {
    "eventId": "string",
    "escalatedTo": "ObjectId",
    "escalatedBy": "ObjectId",
    "reason": "string",
    "urgencyLevel": "string"
  }
}

// Mobile-specific events
{
  "type": "MOBILE_EVENT_SUBMITTED",
  "payload": {
    "event": { /* event object */ },
    "reporter": { /* reporter info */ },
    "requiresVerification": "boolean",
    "submissionMethod": "online | offline_sync"
  }
}

// Notifications
{
  "type": "NOTIFICATION",
  "payload": {
    "severity": "enum: ['info', 'warning', 'error', 'critical', 'emergency']",
    "message": "string",
    "title": "string",
    "eventId": "string: optional",
    "actionRequired": "boolean",
    "targetRoles": ["array of roles to notify"],
    "channels": ["array: ['push', 'email', 'sms', 'dashboard']"],
    "timestamp": "Date"
  }
}

// AI Detection Events
{
  "type": "AI_DETECTION",
  "payload": {
    "detectionId": "string",
    "cameraId": "string",
    "confidence": "number",
    "detectedObjects": ["array"],
    "shouldCreateEvent": "boolean",
    "suggestedEventType": "string"
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
1. Set up shared development environment and Git workflow
2. Create and seed EventType collection with initial types
3. Implement enhanced User model with multiple auth methods
4. Set up enhanced Event model with validation
5. Create API documentation with Swagger/OpenAPI
6. Establish CI/CD pipeline with mobile integration
7. Set up shared testing database with realistic seed data

**Web Team Focus:**
- Backend API structure with mobile endpoints (`/api/mobile/*`)
- EventType management system and admin interface
- Enhanced authentication middleware (JWT + phone verification)
- Database migrations for new schema
- Event validation system with custom rules
- WebSocket infrastructure for real-time updates

**Mobile Team Focus:**
- Project setup with offline-first architecture
- API client with retry logic and offline queuing
- Phone-based authentication flow implementation
- Anonymous reporting capability
- Location services integration with permissions
- Media upload with compression and validation
- Push notification setup

**Shared Deliverables:**
- EventType seeded database with public/private types
- Authentication working for both web and mobile
- Basic event CRUD operations
- Location-based event filtering
- File upload/download functionality

### 5.2 Phase 2: Core Event Management (Week 3-4)
**Both Teams:**
1. Implement enhanced event CRUD operations with validation
2. Set up real-time communication with mobile support
3. Event status management and workflow system
4. Basic event filtering and search functionality
5. Media handling with mobile optimization

**Web Team Focus:**
- Event assignment and escalation system
- Admin interface for EventType management
- Operator dashboard with real-time updates
- Event verification and approval workflow
- Advanced filtering and search capabilities
- User management with role-based permissions

**Mobile Team Focus:**
- Citizen event reporting with step-by-step wizard
- Photo/video capture with automatic compression
- GPS location integration with manual override
- Offline event storage and sync
- Push notifications for event status updates
- "My Events" tracking and follow-up
- Anonymous reporting with session management

**Shared Responsibilities:**
- Mobile-optimized API responses
- Real-time event updates via WebSocket
- File upload progress tracking
- Location-based event discovery
- Cross-platform data synchronization testing

**Integration Points:**
- Mobile event submission → Web operator review
- Real-time notifications web ↔ mobile
- Shared event status workflow
- Consistent media handling and storage

### 5.3 Phase 3: Advanced Features (Week 5-6)
**Web Team:**
- Comprehensive dashboard with analytics and KPIs
- Video streaming integration with event correlation
- Interactive map visualization with event clustering
- Admin panel with system configuration
- Advanced reporting and export functionality
- Event analytics and trend analysis
- Automated event assignment based on location/type
- Integration with external emergency services (CAD systems)

**Mobile Team:**
- Enhanced event reporting with context-aware suggestions
- Location-based event discovery and nearby incidents
- Push notification management and preferences
- Social features (event following, community reporting)
- Offline capability with intelligent sync strategies
- Biometric authentication (Face ID, Touch ID)
- AR-based incident reporting and visualization
- Community verification and crowdsourced validation

**Shared Advanced Features:**
- AI-powered event classification suggestions
- Automated duplicate event detection
- Smart notification routing based on user preferences
- Advanced search with natural language processing
- Event impact assessment and priority scoring
- Integration with IoT sensors and external data sources

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
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-_.!?]+$/
  },
  description: {
    maxLength: 2000,
    sanitize: true // Remove harmful HTML/scripts
  },
  type: {
    required: true,
    enum: ['security_incident', 'traffic_violation', 'emergency', 'maintenance_needed', 'user_report', 'system_alert', 'motion_detected', 'person_detected', 'vehicle_detected', 'unauthorized_access', 'suspicious_activity', 'other']
  },
  severity: {
    required: true,
    enum: ['low', 'medium', 'high', 'critical', 'emergency']
  },
  priority: {
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  location: {
    coordinates: {
      required: true,
      validate: {
        longitude: { min: -180, max: 180 },
        latitude: { min: -90, max: 90 }
      }
    },
    accuracy: {
      min: 0,
      max: 10000 // Maximum 10km accuracy
    },
    address: {
      maxLength: 500
    }
  },
  reporter: {
    isAnonymous: {
      type: "boolean",
      default: false
    },
    name: {
      maxLength: 100,
      required: function() { return this.isAnonymous; }
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: false
    },
    phone: {
      pattern: /^\+?[1-9]\d{1,14}$/,
      required: false
    }
  },
  media: {
    images: {
      maxFiles: 10,
      maxFileSize: "5MB",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"]
    },
    videos: {
      maxFiles: 5,
      maxFileSize: "50MB",
      allowedTypes: ["video/mp4", "video/webm", "video/quicktime"]
    },
    attachments: {
      maxFiles: 15,
      maxFileSize: "10MB",
      allowedTypes: ["application/pdf", "text/plain", "application/msword"]
    }
  },
  tags: {
    maxItems: 10,
    itemMaxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  customFields: {
    maxFields: 20,
    keyMaxLength: 50,
    valueMaxLength: 1000
  },
  // Mobile-specific validation
  mobileSubmission: {
    networkType: {
      enum: ['wifi', 'cellular', 'unknown']
    },
    submittedOffline: {
      type: "boolean",
      default: false
    }
  }
}
```

### 7.2 Error Handling Standards
```javascript
// Standard Error Response Format
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "fieldName",
      "issue": "Specific validation issue",
      "value": "Invalid value provided"
    },
    "suggestions": ["Array of suggested fixes"]
  },
  "timestamp": "2025-12-22T10:00:00Z",
  // Mobile-specific fields
  "retryable": "boolean: whether operation can be retried",
  "offlineSupported": "boolean: whether action can be queued offline"
}

// Common Error Codes
const ErrorCodes = {
  // Validation Errors
  VALIDATION_ERROR: "Validation failed",
  INVALID_EVENT_TYPE: "Event type not allowed for user role",
  LOCATION_REQUIRED: "Location is required for this event type",
  MEDIA_TOO_LARGE: "Uploaded file exceeds size limit",
  INVALID_COORDINATES: "GPS coordinates are invalid",
  
  // Authentication Errors
  AUTH_REQUIRED: "Authentication required",
  INVALID_TOKEN: "Invalid or expired token",
  PHONE_VERIFICATION_FAILED: "Phone verification failed",
  ANONYMOUS_NOT_ALLOWED: "Anonymous reporting not allowed for this event type",
  
  // Permission Errors
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this operation",
  EVENT_TYPE_NOT_PUBLIC: "Event type not available for public reporting",
  ROLE_RESTRICTED: "Action restricted to specific roles",
  
  // Resource Errors
  EVENT_NOT_FOUND: "Event not found",
  USER_NOT_FOUND: "User not found",
  CAMERA_OFFLINE: "Camera is currently offline",
  
  // System Errors
  DATABASE_ERROR: "Database operation failed",
  EXTERNAL_SERVICE_ERROR: "External service unavailable",
  FILE_UPLOAD_ERROR: "File upload failed",
  
  // Mobile-specific Errors
  OFFLINE_SYNC_FAILED: "Failed to sync offline data",
  LOCATION_PERMISSION_DENIED: "Location access denied",
  NETWORK_ERROR: "Network connection error",
  APP_VERSION_OUTDATED: "App version no longer supported"
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
const mockEventTypes = {
  publicSecurity: {
    _id: "eventtype_001",
    name: "Public Safety Incident",
    category: "security",
    isPublic: true,
    allowedRoles: ["citizen", "operator", "admin"],
    defaultSeverity: "medium",
    requiredFields: ["title", "location"]
  },
  emergency: {
    _id: "eventtype_002", 
    name: "Emergency Situation",
    category: "emergency",
    isPublic: true,
    allowedRoles: ["citizen", "operator", "admin"],
    defaultSeverity: "critical",
    requiredFields: ["title", "location", "description"]
  },
  maintenance: {
    _id: "eventtype_003",
    name: "Infrastructure Issue",
    category: "maintenance", 
    isPublic: true,
    allowedRoles: ["citizen", "operator"],
    defaultSeverity: "low",
    requiredFields: ["title", "location"]
  }
};

const mockEvents = {
  citizenReport: {
    title: "Broken Street Light",
    type: "maintenance_needed",
    severity: "low",
    priority: 3,
    status: "pending",
    location: {
      type: "Point",
      coordinates: [34.7818, 32.0853], // [lng, lat]
      address: "Main Street, Tel Aviv"
    },
    reporter: {
      isAnonymous: true,
      name: "Anonymous Citizen",
      email: "citizen@example.com"
    },
    source: "mobile_app",
    publiclyVisible: true
  },
  emergencyAlert: {
    title: "Medical Emergency",
    type: "emergency",
    severity: "critical",
    priority: 1,
    status: "acknowledged",
    location: {
      type: "Point", 
      coordinates: [34.7818, 32.0853]
    },
    reporter: {
      userId: "user_001",
      isAnonymous: false
    },
    source: "mobile_app",
    requiresApproval: false
  },
  aiDetection: {
    title: "Suspicious Activity Detected",
    type: "suspicious_activity",
    severity: "medium",
    priority: 2,
    cameraId: "camera_001",
    detectionData: {
      confidence: 0.85,
      aiModel: "YOLOv8",
      detectedObjects: ["person", "bag"]
    },
    source: "ai_detection",
    verified: false
  }
};

const mockUsers = {
  citizen: {
    username: "citizen_user",
    email: "citizen@example.com",
    role: "citizen",
    authMethod: "phone_otp",
    phone: "+1234567890",
    verification: { isVerified: true },
    mobileSettings: {
      deviceTokens: ["token_123"],
      notificationPreferences: {
        pushEnabled: true,
        eventTypes: ["emergency", "security_incident"]
      }
    }
  },
  operator: {
    username: "operator_1",
    email: "operator@example.com",
    role: "operator",
    authMethod: "email_password",
    permissions: {
      inherited: ["view_events", "update_events", "assign_events"]
    }
  }
};
```

---

## 16. MOBILE-SPECIFIC CONSIDERATIONS

### 16.1 Mobile App Architecture Requirements
- **Offline-First Design**: All critical functions must work offline
- **Progressive Sync**: Intelligent data synchronization when connection available
- **Battery Optimization**: Efficient location tracking and background processing
- **Storage Management**: Local SQLite for offline data with cleanup policies
- **Network Awareness**: Adapt behavior based on connection quality

### 16.2 Mobile API Optimizations
```javascript
// Mobile-optimized response format
{
  "success": true,
  "data": {
    "events": [/* condensed event objects */],
    "pagination": {
      "hasMore": true,
      "nextCursor": "cursor_token"
    }
  },
  "meta": {
    "serverTime": "2025-12-22T10:00:00Z",
    "version": "1.2.0",
    "cacheExpiry": 300 // seconds
  },
  "offline": {
    "supportedActions": ["create_event", "upload_media"],
    "syncRequired": false
  }
}
```

### 16.3 Location Services Integration
```javascript
// Location data structure for mobile
const locationData = {
  coordinates: [longitude, latitude],
  accuracy: 5.0, // meters
  altitude: 100.5,
  altitudeAccuracy: 10.0,
  heading: 45.0, // degrees
  speed: 2.5, // m/s
  timestamp: "2025-12-22T10:00:00Z",
  source: "gps | network | passive",
  address: {
    street: "123 Main Street",
    city: "Tel Aviv",
    region: "Tel Aviv District", 
    country: "Israel",
    postalCode: "12345"
  }
};
```

### 16.4 Push Notification Strategy
```javascript
// Push notification payload structure
{
  "notification": {
    "title": "Event Update",
    "body": "Your reported incident has been acknowledged",
    "badge": 3,
    "sound": "default",
    "icon": "notification_icon"
  },
  "data": {
    "eventId": "event_123",
    "type": "status_update",
    "action": "open_event",
    "priority": "medium",
    "timestamp": "2025-12-22T10:00:00Z"
  },
  "target": {
    "userIds": ["user_123"],
    "roles": ["citizen"],
    "location": {
      "radius": 1000, // meters
      "center": [34.7818, 32.0853]
    }
  }
}
```

### 16.5 Media Upload Optimization
- **Client-side Compression**: Reduce file sizes before upload
- **Progressive Upload**: Resume interrupted uploads
- **Thumbnail Generation**: Create thumbnails for faster loading
- **Format Conversion**: Standardize media formats
- **Background Upload**: Continue uploads when app is backgrounded

### 16.6 Security Considerations for Mobile
- **Certificate Pinning**: Prevent man-in-the-middle attacks
- **Biometric Authentication**: Face ID, Touch ID, fingerprint
- **Secure Storage**: Encrypt sensitive data in local storage
- **App Transport Security**: Enforce HTTPS connections
- **Jailbreak/Root Detection**: Enhanced security for compromised devices

---

## 17. BACKWARD COMPATIBILITY

### 17.1 Legacy API Support
Maintain backward compatibility for existing integrations:
```javascript
// Legacy event type mapping
const legacyTypeMapping = {
  "motion": "motion_detected",
  "face": "person_detected", 
  "lpr": "vehicle_detected",
  "object": "suspicious_activity",
  "manual": "user_report",
  "geofence": "security_incident",
  "emergency": "emergency"
};

// API versioning strategy
// v1: /api/events (legacy)
// v2: /api/v2/events (enhanced)
// Mobile: /api/mobile/events (mobile-optimized)
```

### 17.2 Database Migration Strategy
1. **Gradual Migration**: Migrate data in batches during off-peak hours
2. **Dual Write**: Write to both old and new schemas during transition
3. **Validation**: Verify data integrity after migration
4. **Rollback Plan**: Ability to revert to previous schema if needed

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
- [ ] Event creation time under 30 seconds (mobile and web)
- [ ] Real-time updates delivered within 2 seconds
- [ ] Cross-platform data consistency achieved
- [ ] Zero data loss during offline/online synchronization
- [ ] Mobile app supports offline event reporting
- [ ] Anonymous reporting working seamlessly
- [ ] Push notifications delivered within 5 seconds
- [ ] Photo/video upload completes in under 60 seconds
- [ ] Location accuracy within 10 meters for mobile reports

---

## 15. NEXT STEPS & ACTION ITEMS

### Immediate Actions (This Week)
1. **Both Teams**: Review and approve updated protocol document
2. **Web Team**: Implement EventType management system
3. **Mobile Team**: Set up offline-first architecture foundation
4. **Both Teams**: Create mobile-optimized API endpoints (`/api/mobile/*`)
5. **Both Teams**: Set up enhanced shared communication channels
6. **Web Team**: Implement phone-based authentication backend
7. **Mobile Team**: Implement anonymous reporting capability

### Week 1 Goals
1. Complete EventType system integration
2. Implement enhanced event CRUD with validation
3. Set up mobile authentication (phone + anonymous)
4. Establish real-time communication with mobile support
5. Create mobile-optimized testing procedures

### Week 2 Goals  
1. Mobile event submission with media upload
2. Offline event storage and sync
3. Push notification infrastructure
4. Location-based event discovery
5. Cross-platform integration testing

### Communication Schedule
- **Monday**: Joint planning meeting (1 hour) + mobile-specific sync (30 min)
- **Wednesday**: Technical sync meeting (45 minutes) + API review
- **Friday**: Progress review and integration testing (45 minutes)
- **Daily**: Quick standups via shared Slack channel
- **Ad-hoc**: Emergency communication and blocker resolution

### Code Review Requirements
- **Mobile API Changes**: Must be reviewed by mobile team lead
- **Database Schema Changes**: Must be approved by both teams
- **Authentication Changes**: Cross-platform testing required
- **Real-time Features**: Performance testing on mobile devices

---

**Document Version**: 2.0  
**Last Updated**: December 22, 2025  
**Updated for**: Enhanced Event Model, Mobile Integration, EventType System  
**Next Review**: Weekly during development, with mobile-specific reviews bi-weekly

This protocol has been updated to reflect your current implementation with enhanced data models, mobile citizen reporting, and flexible authentication. The document now includes specific mobile considerations and maintains backward compatibility with your existing system.