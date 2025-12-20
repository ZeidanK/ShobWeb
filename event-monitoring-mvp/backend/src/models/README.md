# Database Models Overview

This file provides a simple overview of all database models and their key fields for easy reference and validation.

## User Model
**Collection**: `users`
**Purpose**: Handles all user types with flexible authentication and permissions

### Key Fields
```
_id: ObjectId
username: String (sparse, unique) - optional for phone-only users
email: String (sparse, unique) - optional for phone-only users
password: String (hashed) - optional for phone auth
phone: String (sparse, unique) - for mobile authentication
role: Enum ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin']
authMethod: Enum ['email_password', 'phone_otp', 'social_oauth']
isActive: Boolean
isVerified: Boolean

profile: {
  firstName: String
  lastName: String
  department: String
  location: { coordinates: [Number], address: String }
  timezone: String
  preferredLanguage: String
}

permissions: {
  granted: [ObjectId] -> Permission
  inherited: [ObjectId] -> Permission
  lastUpdated: Date
  updatedBy: ObjectId -> User
}

authentication: {
  phoneVerified: Boolean
  emailVerified: Boolean
  failedAttempts: Number
  lockoutUntil: Date
}

mobileSettings: {
  deviceTokens: [String]
  lastActiveLocation: { coordinates: [Number], timestamp: Date }
}

usage: {
  eventsCreated: Number
  loginCount: Number
  lastActivityAt: Date
}
```

### Indexes
- username (unique, sparse)
- email (unique, sparse)  
- phone (unique, sparse)
- role
- profile.location (2dsphere)

---

## Event Model
**Collection**: `events`
**Purpose**: Central event tracking with dynamic types and mobile support

### Key Fields
```
_id: ObjectId
title: String (required)
description: String

eventType: {
  typeId: ObjectId -> EventType (required if no legacy type)
  name: String (cached)
  category: String (cached)
}
type: String (legacy enum - for backward compatibility)

severity: Enum ['low', 'medium', 'high', 'critical', 'emergency']
priority: Number [1-5]
status: Enum ['pending', 'acknowledged', 'investigating', 'resolved', 'closed', 'dismissed']

location: {
  coordinates: [Number] (required) [lng, lat]
  address: String
  accuracy: Number
  source: Enum ['gps', 'network', 'manual', 'camera']
}

reporter: {
  userId: ObjectId -> User
  name: String (for anonymous)
  phone: String
  isAnonymous: Boolean
  sessionId: String (for anonymous tracking)
  deviceInfo: { platform: Enum, version: String }
}

media: {
  images: [String] (URLs)
  videos: [String] (URLs)
  attachments: [{
    fileName: String
    fileUrl: String
    fileType: String
    fileSize: Number
    uploadedBy: ObjectId -> User
  }]
}

assignedTo: ObjectId -> User
workflow: [{ status: String, timestamp: Date, userId: ObjectId, notes: String }]

mobileSubmission: {
  submittedOffline: Boolean
  submissionAttempts: Number
  clientTimestamp: Date
  networkType: Enum ['wifi', 'cellular', 'unknown']
}

validation: {
  requiresApproval: Boolean
  approvedBy: ObjectId -> User
  autoApproved: Boolean
}

source: Enum ['camera_system', 'user_report', 'ai_detection', 'mobile_app']
verified: Boolean
publiclyVisible: Boolean
```

### Indexes
- location (2dsphere)
- eventType.typeId
- eventType.category
- type (legacy support)
- status, severity, priority
- assignedTo
- reporter.userId
- source

---

## EventType Model
**Collection**: `eventtypes`
**Purpose**: Dynamic event type management for mobile team

### Key Fields
```
_id: ObjectId
name: String (required, unique with parentType)
description: String
category: Enum ['security', 'traffic', 'emergency', 'maintenance', 'social', 'environmental', 'infrastructure', 'other']
parentType: ObjectId -> EventType (for subtypes)

isActive: Boolean
isPublic: Boolean (can citizens use this?)
requiresVerification: Boolean (needs operator approval?)
allowedRoles: [String] (which roles can create events of this type)

defaultSeverity: Enum ['low', 'medium', 'high', 'critical', 'emergency']
defaultPriority: Number [1-5]
requiredFields: [String] (dynamic validation requirements)

autoAssignmentRules: {
  location: { coordinates: [Number], radius: Number }
  timeRange: { startHour: Number, endHour: Number }
  assignTo: ObjectId -> User
}

metadata: {
  createdBy: ObjectId -> User
  lastModifiedBy: ObjectId -> User
  version: Number
  externalId: String (for mobile team integration)
}

statistics: {
  totalEvents: Number
  lastUsed: Date
  avgResolutionTime: Number
}
```

### Indexes
- name + parentType (unique)
- category
- isActive + isPublic
- allowedRoles

---

## Permission Model
**Collection**: `permissions`
**Purpose**: Granular permission system

### Key Fields
```
_id: ObjectId
name: String (required, unique)
description: String
resource: Enum ['events', 'cameras', 'users', 'eventTypes', 'permissions', 'mobile_users']
actions: [String] ['read', 'create', 'update', 'delete', 'assign', 'approve']
scope: Enum ['global', 'location', 'department', 'self', 'assigned']

conditions: {
  locations: [ObjectId] -> Location
  departments: [String]
  severity: [String]
  timeRestrictions: {
    allowedHours: [{ start: Number, end: Number }]
    allowedDays: [Number] (0-6)
  }
}

metadata: {
  createdBy: ObjectId -> User
  isSystemPermission: Boolean
  version: Number
}

usage: {
  assignedToUsers: Number
  assignedToRoles: Number
}
```

### Indexes
- name (unique)
- resource + actions
- scope

---

## RolePermission Model
**Collection**: `rolepermissions`
**Purpose**: Link roles to permissions

### Key Fields
```
_id: ObjectId
role: Enum ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin']
permission: ObjectId -> Permission
conditionOverrides: {
  scope: String
  locations: [ObjectId]
  departments: [String]
}
assignedBy: ObjectId -> User
isActive: Boolean
```

### Indexes
- role + permission (unique)

---

## Camera Model (Existing)
**Collection**: `cameras`
**Purpose**: Camera device management

### Key Fields
```
_id: ObjectId
name: String
url: String
location: { coordinates: [Number], address: String }
isOnline: Boolean
createdBy: ObjectId -> User
```

---

## AIDetection Model (Existing)
**Collection**: `aidetections`
**Purpose**: AI detection results

### Key Fields
```
_id: ObjectId
cameraId: ObjectId -> Camera
confidence: Number
boundingBox: { x: Number, y: Number, width: Number, height: Number }
detectionType: String
promoted: Boolean
promotedEventId: ObjectId -> Event
```

---

## Model Relationships

```
User (1) ─── (∞) Event [assignedTo, reporter.userId, acknowledgedBy]
User (1) ─── (∞) EventType [createdBy, lastModifiedBy]  
User (1) ─── (∞) Permission [createdBy]
User (1) ─── (∞) RolePermission [assignedBy]

EventType (1) ─── (∞) Event [eventType.typeId]
EventType (1) ─── (∞) EventType [parentType] (self-referencing)

Permission (1) ─── (∞) RolePermission [permission]
Permission (∞) ─── (∞) User [permissions.granted, permissions.inherited]

Camera (1) ─── (∞) Event [cameraId]
Camera (1) ─── (∞) AIDetection [cameraId]

AIDetection (1) ─── (1) Event [detectionId/promotedEventId]
```

## Key Design Decisions

1. **Flexible Authentication**: Users can authenticate via email+password, phone OTP, or social OAuth
2. **Hierarchical Event Types**: EventType supports parent-child relationships for categories/subcategories
3. **Backward Compatibility**: Events support both new eventType reference and legacy type field
4. **Permission Inheritance**: Users get permissions from both their role and individual assignments
5. **Mobile-First**: Anonymous reporting, offline submission tracking, device management
6. **Caching Strategy**: EventType name/category cached in Event for performance
7. **Soft Constraints**: Sparse indexes allow optional fields (username, email, phone)