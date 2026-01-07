# Copilot Instructions for Event Monitoring MVP

This file contains coding standards, architectural patterns, and development practices for the Event Monitoring MVP project. These instructions help ensure consistent code quality and maintainability across the team, including mobile citizen reporting integration.

## 🏗️ Project Architecture

### Overview
This is a microservices-based event monitoring system with the following structure:
- **Frontend**: React + TypeScript + Redux (SPA for operators/admins)
- **Backend**: Node.js + Express + TypeScript (REST API + WebSocket)
- **Mobile API**: Citizen reporting endpoints with flexible authentication
- **AI Service**: Python + FastAPI (AI detection processing)
- **Database**: MongoDB (document-based storage with flexible schemas)
- **Infrastructure**: Docker + Docker Compose

### User Types & Authentication
- **Citizens**: Mobile app users with phone-based authentication (anonymous reporting allowed)
- **Operators**: Dashboard users with email/password authentication
- **Admins**: Full system access with comprehensive permissions
- **Mobile Admins**: Manage mobile app features and citizen-reported events
- **Super Admins**: Ultimate authority with permission management capabilities

### Service Communication
- Frontend ↔ Backend: REST API + WebSocket for real-time updates
- Mobile App ↔ Backend: REST API with mobile-optimized endpoints (`/api/mobile/*`)
- Backend ↔ AI Service: HTTP API for detection processing
- Backend ↔ Database: Mongoose ODM with flexible schemas and inheritance

## 📁 Project Structure Standards

### Backend (`/backend/src/`)
```
src/
├── app.ts                    # Main Express application
├── controllers/             # Request handlers and business logic
│   ├── mobileEventController.ts    # Citizen reporting endpoints
│   ├── mobileAuthController.ts     # Phone-based authentication
│   └── eventController.ts          # Standard event management
├── middleware/             # Authentication, validation, error handling
│   ├── mobileAuth.ts       # Phone verification and anonymous auth
│   └── auth.ts             # Standard JWT authentication
├── models/                 # MongoDB schemas and interfaces
│   ├── EventType.ts        # Dynamic event type system
│   ├── Permission.ts       # Granular permission management
│   ├── User.ts            # Enhanced user model with roles
│   └── Event.ts           # Updated event model with EventType refs
├── routes/                # API route definitions
│   ├── mobile/           # Mobile-specific endpoints
│   └── eventTypes.ts     # EventType management for mobile team
└── utils/                # Database connection and utilities
    ├── eventTypeMapper.ts  # Backward compatibility layer
    └── mediaUpload.ts      # Mobile image/video processing
```

### Frontend (`/frontend/src/`)
```
src/
├── App.tsx                 # Main application component
├── components/             # Reusable UI components
├── pages/                  # Page-level components
├── services/               # API calls and external services
├── store/                  # Redux state management
└── types/                  # TypeScript type definitions
```

## 🎯 TypeScript Coding Standards

### File Organization
- Use **PascalCase** for component files: `EventCard.tsx`, `UserController.ts`
- Use **camelCase** for utility files: `database.ts`, `validation.ts`
- Export interfaces with `I` prefix: `IEvent`, `IUser`, `ICamera`, `IEventType`, `IPermission`
- Mobile controllers use `mobile` prefix: `mobileEventController.ts`, `mobileAuthController.ts`

### Enhanced Model System
The project uses a flexible schema system to support mobile integration:

```typescript
// Dynamic EventType model for flexible event categorization
export interface IEventType extends Document {
  name: string;
  category: 'security' | 'traffic' | 'emergency' | 'maintenance' | 'social' | 'environmental';
  parentType?: mongoose.Types.ObjectId; // Hierarchical types/subtypes
  isPublic: boolean; // Available for citizen reporters
  allowedRoles: string[]; // Which user roles can use this type
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  requiredFields: string[]; // Dynamic field requirements
}

// Enhanced Event model with EventType integration
export interface IEvent extends Document {
  eventType: {
    typeId: mongoose.Types.ObjectId; // Reference to EventType
    name: string; // Cached for performance
    category: string; // Cached for performance
  };
  type?: string; // Legacy field for backward compatibility
  reporter: {
    userId?: mongoose.Types.ObjectId;
    isAnonymous: boolean;
    sessionId?: string; // For anonymous mobile users
    deviceInfo?: { platform: 'ios' | 'android' | 'web' };
  };
  mobileSubmission?: {
    submittedOffline: boolean;
    networkType: 'wifi' | 'cellular' | 'unknown';
  };
}

// Flexible User model with multiple authentication methods
export interface IUser extends Document {
  role: 'citizen' | 'operator' | 'admin' | 'mobile_admin' | 'super_admin';
  authMethod: 'email_password' | 'phone_otp' | 'social_oauth';
  phone?: string; // For mobile authentication
  permissions: {
    granted: mongoose.Types.ObjectId[]; // Individual permissions
    inherited: mongoose.Types.ObjectId[]; // Role-based permissions
  };
  mobileSettings?: {
    deviceTokens: string[]; // Push notification support
  };
}
```

### Function Documentation
Always include JSDoc comments for functions and components:
```typescript
/**
 * Creates a new event in the system
 * 
 * @param eventData - The event data to create
 * @param userId - ID of the user creating the event
 * @returns Promise<IEvent> - The created event
 * @throws {ValidationError} When event data is invalid
 */
export const createEvent = async (eventData: CreateEventDTO, userId: string): Promise<IEvent> => {
  // Implementation here
};
```

## 🔧 API Development Patterns

### Dual API Structure
The system supports both traditional operator APIs and mobile citizen APIs:

**Operator/Admin APIs** (`/api/*`):
```typescript
// Standard authentication with JWT
GET  /api/events                    # Paginated event listing with filters
POST /api/events                    # Create event (operators/admins)
PUT  /api/events/:id                # Update event details
```

**Mobile Citizen APIs** (`/api/mobile/*`):
```typescript
// Phone-based or anonymous authentication
GET  /api/mobile/event-types        # Public event types for citizens
POST /api/mobile/events             # Citizen event reporting
POST /api/mobile/auth/phone-verify  # Phone number verification
GET  /api/mobile/events/my          # User's submitted events
```

### Enhanced Controller Structure
All controllers now support flexible permissions and mobile optimization:

```typescript
export const createMobileEvent = [
  // Mobile-optimized validation
  body('eventType.typeId').isMongoId().withMessage('Valid event type is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
  body('reporter.isAnonymous').isBoolean(),
  
  // Permission check with EventType validation
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        });
        return;
      }

      // Verify EventType is public and allowed for citizen role
      const eventType = await EventType.findById(req.body.eventType.typeId);
      if (!eventType?.isPublic || !eventType.allowedRoles.includes('citizen')) {
        res.status(403).json({
          success: false,
          message: 'Event type not available for public reporting'
        });
        return;
      }

      // Create event with validation requirements
      const event = await Event.create({
        ...req.body,
        eventType: {
          typeId: eventType._id,
          name: eventType.name,
          category: eventType.category
        },
        source: 'mobile_app',
        validation: {
          requiresApproval: eventType.requiresVerification,
          autoApproved: !eventType.requiresVerification
        }
      });
      
      // Mobile-optimized response
      res.status(201).json({
        success: true,
        message: 'Event reported successfully',
        data: { 
          event: {
            id: event._id,
            status: event.status,
            requiresApproval: event.validation.requiresApproval
          }
        }
      });
    } catch (error) {
      console.error('Mobile event creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report event'
      });
    }
  }
];
```

### Enhanced Response Format Standards
All API responses follow this format with additional mobile considerations:

```typescript
interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Mobile-specific fields
  requiresAuth?: boolean;      // Indicates if authentication is needed
  syncTimestamp?: Date;        // For offline sync coordination
  rateLimit?: {                // Rate limiting info for mobile apps
    remaining: number;
    resetTime: Date;
  };
}

// Mobile event submission response
interface MobileEventResponse {
  success: boolean;
  message: string;
  data: {
    event: {
      id: string;
      status: string;
      requiresApproval: boolean;
      estimatedProcessingTime?: number; // In minutes
    };
  };
  nextActions?: {              // Guide user on next steps
    canUploadMedia: boolean;
    canTrackStatus: boolean;
    contactInfo?: string;
  };
}
```

## ⚛️ React Component Standards

### Component Structure
```typescript
/**
 * EventCard Component
 * 
 * Displays event information in a card format with status indicators
 * and action buttons for event management.
 * 
 * @param event - The event data to display
 * @param onStatusChange - Callback when event status is changed
 * @param className - Additional CSS classes
 */
interface EventCardProps {
  event: IEvent;
  onStatusChange?: (eventId: string, newStatus: string) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, onStatusChange, className }) => {
  // Component logic here
  
  return (
    <div className={`event-card ${className || ''}`}>
      {/* Component JSX */}
    </div>
  );
};

export default EventCard;
```

### Redux State Management
- Use Redux Toolkit for state management
- Create separate slices for each domain (auth, events, cameras, users)
- Use typed hooks (`useAppSelector`, `useAppDispatch`)

```typescript
// Store slice example
const eventSlice = createSlice({
  name: 'events',
  initialState: {
    items: [] as IEvent[],
    loading: false,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEvents: (state, action) => {
      state.items = action.payload;
    }
  }
});
```

## 🗄️ Enhanced Database Standards

### Flexible Schema Design with EventType System
The system uses dynamic EventType references instead of hardcoded enums:

```typescript
// EventType model for dynamic type management
const EventTypeSchema = new Schema<IEventType>({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['security', 'traffic', 'emergency', 'maintenance', 'social', 'environmental'],
    required: true
  },
  parentType: {
    type: Schema.Types.ObjectId,
    ref: 'EventType', // Supports hierarchical types/subtypes
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false // Can citizens use this type?
  },
  allowedRoles: {
    type: [String],
    required: true,
    validate: {
      validator: function(roles: string[]) {
        const validRoles = ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin'];
        return roles.every(role => validRoles.includes(role));
      }
    }
  },
  defaultSeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'emergency'],
    default: 'medium'
  },
  requiredFields: {
    type: [String], // Dynamic field requirements
    default: ['title', 'location']
  },
  autoAssignmentRules: {
    // Intelligent auto-assignment based on location, time, severity
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
      radius: Number
    },
    assignTo: { type: Schema.Types.ObjectId, ref: 'User' }
  }
});

// Enhanced Event model with EventType integration
const EventSchema = new Schema<IEvent>({
  eventType: {
    typeId: {
      type: Schema.Types.ObjectId,
      ref: 'EventType',
      required: function() { return !this.type; } // Either new or legacy
    },
    name: String, // Cached for performance
    category: String // Cached for performance
  },
  type: {
    // Legacy field for backward compatibility
    type: String,
    enum: ['security_incident', 'traffic_violation', 'emergency', '...'],
    required: function() { return !this.eventType?.typeId; }
  },
  reporter: {
    isAnonymous: { type: Boolean, default: false },
    sessionId: String, // For anonymous mobile tracking
    deviceInfo: {
      platform: { type: String, enum: ['ios', 'android', 'web'] }
    }
  },
  mobileSubmission: {
    submittedOffline: { type: Boolean, default: false },
    submissionAttempts: { type: Number, default: 1 },
    networkType: { type: String, enum: ['wifi', 'cellular', 'unknown'] }
  },
  validation: {
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    autoApproved: { type: Boolean, default: false }
  }
});

// Pre-save middleware to populate EventType cache
EventSchema.pre('save', async function() {
  if (this.eventType?.typeId && this.isModified('eventType.typeId')) {
    const eventType = await mongoose.model('EventType').findById(this.eventType.typeId);
    if (eventType) {
      this.eventType.name = eventType.name;
      this.eventType.category = eventType.category;
      // Auto-set defaults from EventType
      if (this.isNew) {
        this.severity = this.severity || eventType.defaultSeverity;
        this.priority = this.priority || eventType.defaultPriority;
      }
    }
  }
});
```

## 🐳 Docker & Environment Standards

### Docker Configuration
- Use multi-stage builds for production optimization
- Include health checks in all services
- Use environment variables for configuration
- Follow security best practices (non-root users, minimal base images)

### Environment Variables
Always use environment variables for:
- Database connection strings
- API keys and secrets
- Service URLs and ports
- Feature flags

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/event_monitoring
MONGODB_TEST_URI=mongodb://localhost:27017/event_monitoring_test

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://ai-service:8000
AI_SERVICE_API_KEY=your_ai_api_key
```

## 🔐 Enhanced Security & Authorization Standards

### Multi-Tier Authentication System
Support for different user types with appropriate authentication methods:

```typescript
// Phone-based authentication for mobile citizens
export const verifyPhoneOTP = async (phone: string, otp: string) => {
  // Verify OTP and create/update user
  const user = await User.findOneAndUpdate(
    { phone, authMethod: 'phone_otp' },
    {
      $set: { 
        'authentication.phoneVerified': true,
        lastLogin: new Date()
      },
      $inc: { 'usage.loginCount': 1 }
    },
    { new: true, upsert: true }
  );
  
  // Generate session token (shorter lived for mobile)
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Extended for mobile convenience
  );
  
  return { user, token };
};

// Permission-based middleware with context awareness
export const requirePermission = (permissionName: string, options: {
  resource?: string;
  action?: string;
  allowAnonymous?: boolean;
  mobileOptimized?: boolean;
} = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Handle anonymous access for certain mobile endpoints
      if (options.allowAnonymous && !req.user) {
        // Rate limit anonymous requests more aggressively
        const rateLimitConfig = options.mobileOptimized ? 
          { windowMs: 15 * 60 * 1000, max: 5 } : // 5 per 15 minutes
          { windowMs: 15 * 60 * 1000, max: 100 };
        // Apply rate limiting logic here
        return next();
      }
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          requiresAuth: true
        });
      }
      
      // Context for permission checking
      const context = {
        location: req.body?.location || req.query?.location,
        severity: req.body?.severity || req.query?.severity,
        currentTime: new Date(),
        userIp: req.ip
      };
      
      const hasPermission = await req.user.hasPermission(permissionName, context);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission validation failed'
      });
    }
  };
};
```

### Granular Permission System
The system implements flexible role-based access control with individual permission assignment:

```typescript
// Permission model for fine-grained authorization
const PermissionSchema = new Schema<IPermission>({
  name: { type: String, unique: true, required: true },
  resource: {
    type: String,
    enum: ['events', 'cameras', 'users', 'eventTypes', 'permissions', 'mobile_users'],
    required: true
  },
  actions: {
    type: [String],
    enum: ['read', 'create', 'update', 'delete', 'assign', 'approve', 'reject'],
    required: true
  },
  scope: {
    type: String,
    enum: ['global', 'location', 'department', 'self', 'assigned'],
    default: 'self'
  },
  conditions: {
    locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
    severity: [{ type: String, enum: ['low', 'medium', 'high', 'critical', 'emergency'] }],
    timeRestrictions: {
      allowedHours: [{ start: Number, end: Number }],
      allowedDays: [{ type: Number, min: 0, max: 6 }]
    }
  }
});

// Enhanced User model with flexible permissions
const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['citizen', 'operator', 'admin', 'mobile_admin', 'super_admin'],
    default: 'citizen'
  },
  authMethod: {
    type: String,
    enum: ['email_password', 'phone_otp', 'social_oauth'],
    default: 'email_password'
  },
  phone: {
    type: String,
    sparse: true,
    match: /^\+?[1-9]\d{1,14}$/
  },
  permissions: {
    granted: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    inherited: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    lastUpdated: { type: Date, default: Date.now }
  },
  authentication: {
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: Date
  }
});

// Permission checking method
UserSchema.methods.hasPermission = async function(permissionName: string, context?: any) {
  const allPermissionIds = [...this.permissions.granted, ...this.permissions.inherited];
  const permissions = await mongoose.model('Permission').find({ 
    _id: { $in: allPermissionIds },
    name: permissionName 
  });
  return permissions.some(permission => permission.appliesToConditions(context || {}));
};
```

## 📱 Mobile API Integration Standards

### Mobile-First Design Principles
- **Offline Support**: All critical features should work offline and sync when connected
- **Battery Efficiency**: Minimize API calls and optimize data transfer
- **Progressive Enhancement**: Gracefully degrade features based on network conditions
- **Anonymous Friendly**: Support anonymous reporting with optional authentication

### Mobile Endpoint Patterns
```typescript
// Mobile event submission with offline support
POST /api/mobile/events
{
  "eventType": { "typeId": "ObjectId", "name": "Traffic Issue" },
  "title": "Pothole on Main Street",
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "accuracy": 10,
    "source": "gps"
  },
  "media": {
    "images": ["data:image/jpeg;base64,..."], // Support base64 for offline
    "videos": []
  },
  "reporter": {
    "isAnonymous": true,
    "sessionId": "uuid-for-anonymous-tracking"
  },
  "mobileSubmission": {
    "submittedOffline": false,
    "clientTimestamp": "2024-01-01T12:00:00Z",
    "networkType": "wifi"
  }
}

// Mobile-optimized response
{
  "success": true,
  "message": "Event submitted successfully",
  "data": {
    "event": {
      "id": "event-id",
      "status": "pending",
      "trackingNumber": "EV-2024-001",
      "requiresApproval": true,
      "estimatedProcessingTime": 30
    }
  },
  "nextActions": {
    "canUploadMedia": true,
    "canTrackStatus": true,
    "mediaUploadEndpoint": "/api/mobile/events/event-id/media"
  },
  "syncTimestamp": "2024-01-01T12:00:00Z"
}

// EventType management for mobile team
GET /api/mobile/event-types
{
  "success": true,
  "data": [
    {
      "id": "type-id",
      "name": "Traffic Issue",
      "category": "traffic",
      "description": "Report traffic problems",
      "requiredFields": ["title", "location"],
      "allowsMedia": true,
      "parentType": {
        "id": "parent-id",
        "name": "Transportation"
      }
    }
  ]
}
```

### Offline Synchronization Support
```typescript
// Batch sync endpoint for offline submissions
POST /api/mobile/sync/events
{
  "events": [
    {
      "clientId": "client-generated-uuid",
      "submittedAt": "2024-01-01T10:00:00Z",
      "eventData": { /* event object */ }
    }
  ],
  "lastSyncTimestamp": "2024-01-01T09:00:00Z"
}

// Response with conflict resolution
{
  "success": true,
  "data": {
    "synced": [
      {
        "clientId": "client-uuid-1",
        "serverId": "server-generated-id",
        "status": "created"
      }
    ],
    "conflicts": [
      {
        "clientId": "client-uuid-2",
        "reason": "duplicate_location_time",
        "resolution": "merged_with_existing",
        "serverId": "existing-event-id"
      }
    ]
  },
  "nextSyncAfter": "2024-01-01T12:30:00Z"
}
```

### Anonymous User Session Management
```typescript
// Anonymous session creation
POST /api/mobile/auth/anonymous-session
{
  "deviceInfo": {
    "platform": "ios",
    "version": "17.0",
    "appVersion": "1.2.0"
  },
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "accuracy": 50
  }
}

// Session response
{
  "success": true,
  "data": {
    "sessionId": "anonymous-uuid",
    "permissions": ["submit_events", "view_own_events"],
    "expiresAt": "2024-01-02T12:00:00Z",
    "rateLimit": {
      "eventsPerHour": 5,
      "remaining": 5
    }
  }
}
```

## 📝 Documentation Standards

### Code Comments
- Use JSDoc for functions and classes
- Explain complex business logic
- Document API endpoints with examples
- Include error scenarios in documentation

### README Structure
Each module should have a README with:
- Purpose and functionality
- Setup and installation steps
- API documentation (if applicable)
- Usage examples
- Troubleshooting section

## 🚀 Deployment & DevOps

### Git Workflow
- Use feature branches for new development
- Require pull requests for main branch
- Include meaningful commit messages
- Tag releases with semantic versioning

### CI/CD Pipeline
- Run tests on all pull requests
- Build and push Docker images
- Deploy to staging environment first
- Automated rollback procedures

## 🎨 UI/UX Standards

### Component Design
- Mobile-first responsive design
- Consistent color scheme and typography
- Loading states for all async operations
- Error boundaries for graceful error handling
- Accessibility compliance (WCAG 2.1)

### User Experience
- Clear navigation and breadcrumbs
- Immediate feedback for user actions
- Progressive loading for large datasets
- Offline support where applicable

## 🔄 Real-time Features

### WebSocket Communication
```typescript
// Socket.IO event patterns
socket.on('event:created', (event: IEvent) => {
  // Handle new event notification
  dispatch(addEvent(event));
  showNotification(`New ${event.severity} event: ${event.title}`);
});

socket.on('camera:status_changed', (camera: ICamera) => {
  // Update camera status in real-time
  dispatch(updateCameraStatus(camera));
});
```

## 📊 Performance Standards

### Optimization Guidelines
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Use database indexing for frequently queried fields
- Implement caching for static data
- Optimize images and media files
- Use pagination for large datasets

### Monitoring Requirements
- Log all errors with context
- Monitor API response times
- Track user interactions
- Monitor resource usage
- Set up alerts for critical issues

## 🏷️ Enhanced Naming Conventions

### Variables and Functions
- Use descriptive, self-documenting names
- Boolean variables start with `is`, `has`, `can`, `should`
- Functions use verb-noun pattern: `createEvent`, `validateUser`, `syncMobileEvents`
- Constants use SCREAMING_SNAKE_CASE: `MAX_FILE_SIZE`, `MOBILE_API_VERSION`
- Mobile-specific functions use `mobile` prefix: `processMobileEvent`, `validateMobileAuth`

### Database Collections and Fields
- Collection names are lowercase plural: `events`, `eventtypes`, `permissions`, `rolepermissions`
- Field names use camelCase: `createdAt`, `assignedTo`, `eventType.typeId`
- Avoid abbreviations: use `description` not `desc`, `coordinates` not `coords`
- Mobile fields use descriptive prefixes: `mobileSubmission`, `deviceInfo`, `sessionId`

### API Endpoints
- Standard endpoints: `/api/resource` (e.g., `/api/events`, `/api/users`)
- Mobile endpoints: `/api/mobile/resource` (e.g., `/api/mobile/events`, `/api/mobile/auth`)
- EventType management: `/api/event-types` (accessible by mobile team)
- Sync endpoints: `/api/mobile/sync/*` for offline coordination

## 📊 Performance & Monitoring Standards

### Mobile-Optimized Performance
```typescript
// Implement pagination for mobile with smaller page sizes
const getMobileEvents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 20); // Max 20 for mobile
  
  const events = await Event.find({ 
    'reporter.userId': req.user._id 
  })
    .select('_id title status createdAt eventType.name') // Limited fields for mobile
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean(); // Use lean() for better performance
    
  res.json({
    success: true,
    data: events,
    pagination: {
      page,
      limit,
      total: await Event.countDocuments({ 'reporter.userId': req.user._id })
    }
  });
};

// Implement response caching for EventTypes
const getCachedEventTypes = async (req: Request, res: Response) => {
  const cacheKey = 'public-event-types';
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return res.json({ 
      success: true, 
      data: JSON.parse(cached),
      cached: true 
    });
  }
  
  const eventTypes = await EventType.find({ 
    isActive: true, 
    isPublic: true 
  }).lean();
  
  await redis.setex(cacheKey, 300, JSON.stringify(eventTypes)); // 5 min cache
  
  res.json({ success: true, data: eventTypes });
};
```

### Error Handling & Logging
```typescript
// Mobile-specific error responses
export const mobileErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Mobile API Error:', {
    error: error.message,
    stack: error.stack,
    endpoint: req.path,
    userAgent: req.headers['user-agent'],
    userId: req.user?._id
  });

  // Don't expose internal errors to mobile clients
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: Object.values(error.errors).map((e: any) => ({
        field: e.path,
        message: e.message
      })),
      code: 'VALIDATION_ERROR'
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format',
      code: 'INVALID_FORMAT'
    });
  }

  // Generic error for production
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
    code: 'INTERNAL_ERROR',
    supportInfo: process.env.NODE_ENV === 'production' ? 
      'Contact support if problem persists' : error.message
  });
};
```

## 🚀 Deployment & Integration Standards

### Environment Configuration
```bash
# Mobile-specific environment variables
MOBILE_API_VERSION=1.0
MOBILE_RATE_LIMIT_PER_HOUR=100
ANONYMOUS_RATE_LIMIT_PER_HOUR=10
MOBILE_FILE_UPLOAD_MAX_SIZE=10MB
MOBILE_SESSION_DURATION=7d

# EventType management
EVENTTYPE_CACHE_DURATION=300
EVENTTYPE_AUTO_APPROVAL_THRESHOLD=0.8

# Permission system
PERMISSION_CACHE_DURATION=600
ROLE_PERMISSION_SYNC_INTERVAL=3600

# Backward compatibility
LEGACY_EVENT_TYPE_SUPPORT=true
MIGRATION_MODE=gradual
```

### Documentation Requirements
Always document:
- Mobile API endpoints with request/response examples
- Permission requirements for each endpoint
- EventType usage and management procedures
- Backward compatibility considerations
- Migration procedures for legacy data

```typescript
/**
 * Create Event (Mobile API)
 * 
 * Allows citizen reporters to submit events using dynamic EventTypes.
 * Supports offline submission and automatic approval workflows.
 * 
 * @route POST /api/mobile/events
 * @permission events.create (auto-granted to verified citizens)
 * @rateLimit 5 per hour for anonymous, 20 per hour for verified
 * 
 * @requestBody {Object} event - Event data
 * @requestBody {Object} event.eventType - EventType reference
 * @requestBody {string} event.eventType.typeId - Must be public EventType
 * @requestBody {Array<number>} event.location.coordinates - [lng, lat]
 * @requestBody {boolean} event.reporter.isAnonymous - Anonymous reporting flag
 * 
 * @response {Object} result - Creation result
 * @response {Object} result.data.event - Created event summary
 * @response {Object} result.nextActions - Available follow-up actions
 * 
 * @example
 * // Request
 * {
 *   "eventType": { "typeId": "64a1b2c3d4e5f6789abcdef0" },
 *   "title": "Broken streetlight",
 *   "location": { "coordinates": [-122.4194, 37.7749] },
 *   "reporter": { "isAnonymous": true }
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": { "event": { "id": "...", "status": "pending" } },
 *   "nextActions": { "canUploadMedia": true }
 * }
 */
export const createMobileEvent = [/* implementation */];
```

Remember: The goal is to write code that seamlessly integrates mobile citizen reporting with the existing operator system, maintains backward compatibility during migration, and provides a flexible foundation for future enhancements. When in doubt, prioritize user experience, system flexibility, and clear documentation over rigid implementation patterns.