# Mobile Integration Work Plan
## Multi-Tenant Standalone Mobile App Implementation

### 📋 Executive Summary

Based on discussions with mobile team lead, we're implementing a **multi-tenant standalone mobile app** with the following key changes:

1. **API Key-Based Multi-Tenancy**: Companies get unique API keys for isolated data access
2. **First Responder Users**: New user type managed by web team, used by mobile app
3. **Dynamic Event Types**: Flexible type/subtype system with auto-generation capability
4. **Live Location Tracking**: Real-time first responder tracking on map

---

## 🏗️ Core Architecture Changes

### 1. Multi-Tenancy System
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Company A     │────│  API Gateway     │────│  Web Dashboard  │
│   Mobile App    │    │  (API Key Auth)  │    │  (Multi-Tenant) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         └──────────────▶│  Database       │◀────────────┘
                         │  (Company       │
                         │   Isolated)     │
                         └─────────────────┘
```

**Implementation:**
- Each company gets unique API key
- All API requests include `X-API-Key` header
- Data filtering by `companyId` in all queries
- Company-specific event types and settings

### 2. New User Types & Authentication Flow
```
Web Users:           Mobile Users:
- super_admin       - first_responder (phone + password)
- admin             - citizen (various auth methods)
- operator          - anonymous (company context only)
- company_admin     
- mobile_admin      
```

### 3. Dynamic Event Type System
```
Current: Fixed enum types
New:     Database-driven types with auto-creation

Mobile App → "Traffic Incident" → API checks EventTypes table
                                 → If not found, auto-create pending approval
                                 → Store event with type string
```

---

## 🚧 Implementation Plan

### Phase 1: Foundation (Week 1-2)
#### Database Schema Updates
- [ ] **Add Company Model** with API key management
- [ ] **Enhance User Model** for first responder role
- [ ] **Update Event Model** with companyId and dynamic types
- [ ] **Create EventType Model** for flexible type management
- [ ] **Add Location Tracking Model** for first responder pings

#### API Infrastructure
- [ ] **API Key Middleware** for request validation and company context
- [ ] **Multi-tenant Data Filtering** in all database queries
- [ ] **Company Management Endpoints** for admin operations
- [ ] **Enhanced Authentication** for first responders

#### Database Migration
```sql
-- Add company reference to events
ALTER TABLE events ADD COLUMN companyId ObjectId;
ALTER TABLE events ADD COLUMN type String; -- Dynamic type field
ALTER TABLE events ADD COLUMN subType String; -- Dynamic subtype
ALTER TABLE events ADD INDEX company_type (companyId, type);

-- Create company collection with indexes
CREATE INDEX companies.apiKey;
CREATE INDEX companies.status;
```

### Phase 2: Mobile Integration (Week 3-4)
#### Mobile-Specific Endpoints
- [ ] **First Responder Authentication** (`POST /api/mobile/auth/first-responder`)
- [ ] **Company-Filtered Event Submission** (`POST /api/mobile/events`)
- [ ] **Dynamic Event Type Retrieval** (`GET /api/mobile/event-types`)
- [ ] **Location Ping Endpoint** (`POST /api/mobile/location/ping`)

#### Real-Time Updates
- [ ] **Company-Scoped WebSocket Channels** (`/ws/company/:companyId`)
- [ ] **First Responder Location Broadcasting** for live tracking
- [ ] **Event Assignment Notifications** for first responders

#### Event Type Management
- [ ] **Auto-Generation Logic** for unknown types from mobile
- [ ] **Approval Workflow** for new types
- [ ] **Company-Specific Type Customization**

### Phase 3: Advanced Features (Week 5-6)
#### Live Tracking & Assignment
- [ ] **First Responder Map Integration** showing live locations
- [ ] **Proximity-Based Assignment** logic
- [ ] **ETA Calculation** and tracking
- [ ] **Status Management** (available, busy, en-route, on-scene)

#### Company Administration
- [ ] **Company Onboarding Portal** for new clients
- [ ] **Usage Analytics Dashboard** per company
- [ ] **API Key Rotation** and security management
- [ ] **Billing Integration** based on usage metrics

---

## 🔧 Technical Implementation Details

### API Key Authentication Flow
```javascript
// API Key Middleware
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const company = await Company.findOne({ 
    apiKey: apiKey, 
    status: 'active' 
  });
  
  if (!company) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  // Add company context to request
  req.company = company;
  req.companyId = company._id;
  
  // Check API limits
  if (company.apiUsage.currentMonthCalls >= company.subscription.limits.apiCallsLimit) {
    return res.status(429).json({ error: 'API limit exceeded' });
  }
  
  // Update usage counter
  await Company.updateOne(
    { _id: company._id },
    { $inc: { 'apiUsage.currentMonthCalls': 1 } }
  );
  
  next();
}
```

### Dynamic Event Type Creation
```javascript
// Mobile Event Submission
async function submitEvent(req, res) {
  const { type, subType, ...eventData } = req.body;
  const companyId = req.companyId;
  
  // Find or create event type
  let eventType = await EventType.findOne({ 
    name: type, 
    $or: [
      { companyId: companyId },
      { isGlobal: true }
    ]
  });
  
  if (!eventType) {
    // Auto-create new event type
    eventType = await EventType.create({
      name: type,
      companyId: companyId,
      isAutoGenerated: true,
      approvalStatus: 'pending',
      createdBy: req.user?.id,
      subTypes: subType ? [{ name: subType }] : []
    });
    
    // Notify admins of new type
    notifyNewEventType(eventType);
  }
  
  // Create event with type reference
  const event = await Event.create({
    ...eventData,
    companyId,
    eventTypeId: eventType._id,
    type: type,
    subType: subType
  });
  
  // Broadcast real-time update to company channel
  io.to(`company-${companyId}`).emit('new-event', event);
  
  res.status(201).json(event);
}
```

### First Responder Location Tracking
```javascript
// Location Ping Handler
async function updateResponderLocation(req, res) {
  const { latitude, longitude, accuracy, status } = req.body;
  const userId = req.user.id;
  const companyId = req.companyId;
  
  // Save location ping
  const locationPing = await LocationPing.create({
    userId,
    companyId,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    accuracy,
    status,
    timestamp: new Date()
  });
  
  // Update user's current location
  await User.updateOne(
    { _id: userId },
    { 
      'firstResponderProfile.currentLocation': {
        type: 'Point',
        coordinates: [longitude, latitude],
        accuracy,
        lastPing: new Date()
      },
      'firstResponderProfile.currentStatus': status
    }
  );
  
  // Broadcast to company's live tracking channel
  io.to(`tracking-${companyId}`).emit('responder-location-update', {
    userId,
    location: { latitude, longitude },
    status,
    accuracy,
    timestamp: new Date()
  });
  
  res.json({ success: true });
}
```

---

## 📊 Database Schema Changes

### New Collections

#### 1. Companies Collection
```javascript
{
  _id: ObjectId,
  name: "Acme Security Corp",
  apiKey: "ask_1234567890abcdef", // Prefix: ask_ (API Secret Key)
  apiSecret: "hashed_secret",
  status: "active",
  subscription: {
    plan: "professional",
    limits: {
      maxUsers: 50,
      maxEvents: 1000,
      apiCallsLimit: 10000
    }
  },
  settings: {
    allowAnonymousReporting: true,
    enableFirstResponderTracking: true,
    locationTrackingInterval: 30 // seconds
  }
}
```

#### 2. Enhanced EventTypes Collection
```javascript
{
  _id: ObjectId,
  name: "Traffic Incident",
  companyId: ObjectId, // null for global types
  isGlobal: false,
  isAutoGenerated: true,
  approvalStatus: "pending",
  subTypes: [
    { name: "Vehicle Accident", isActive: true },
    { name: "Traffic Jam", isActive: true }
  ],
  usage: {
    totalEvents: 42,
    lastUsed: ISODate,
    averageResolutionTime: 35 // minutes
  }
}
```

#### 3. Location Tracking Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // first responder
  companyId: ObjectId,
  location: {
    type: "Point",
    coordinates: [-74.006, 40.7128] // [lng, lat]
  },
  accuracy: 5.0, // meters
  status: "available", // available, busy, en_route, on_scene
  eventId: ObjectId, // if responding to specific event
  timestamp: ISODate,
  battery: 85 // device battery %
}
```

### Updated Collections

#### Enhanced Events Collection
```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // REQUIRED - links to company
  eventTypeId: ObjectId, // reference to EventType
  type: "Traffic Incident", // dynamic string
  subType: "Vehicle Accident", // dynamic string
  firstResponder: {
    assignedResponder: ObjectId,
    dispatchedAt: ISODate,
    status: "en_route",
    eta: ISODate,
    currentLocation: {
      type: "Point", 
      coordinates: [-74.006, 40.7128],
      lastPing: ISODate
    }
  },
  // ... existing fields
}
```

#### Enhanced Users Collection
```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // for first_responder, citizen
  role: "first_responder", // new role
  authMethod: "phone_password", // new method
  phone: "+1234567890", // username for first responders
  firstResponderProfile: {
    badgeNumber: "FR-001",
    specializations: ["medical", "fire"],
    currentStatus: "available",
    currentLocation: {
      type: "Point",
      coordinates: [-74.006, 40.7128],
      lastPing: ISODate,
      isTracking: true
    },
    shiftSchedule: {
      startTime: "08:00",
      endTime: "20:00",
      daysOfWeek: [1,2,3,4,5] // Mon-Fri
    }
  }
}
```

---

## 🚀 API Endpoints Summary

### Company Management
- `GET /api/companies` - List companies (super admin)
- `POST /api/companies` - Create company (super admin)
- `GET /api/company/profile` - Get own company (company admin)
- `POST /api/company/users` - Create first responder

### Enhanced Mobile APIs (Require API Key)
- `POST /api/mobile/auth/first-responder` - First responder login
- `POST /api/mobile/events` - Submit event (company context)
- `GET /api/mobile/event-types` - Get available types
- `POST /api/mobile/location/ping` - Location update
- `GET /api/mobile/responders/nearby` - Find nearby responders

### Real-Time Channels
- `WebSocket: /ws/company/:companyId` - Company-specific events
- `WebSocket: /ws/tracking/:companyId` - Live responder tracking
- `WebSocket: /ws/responder/:userId` - Individual responder channel

---

## ✅ Success Metrics

### Technical Milestones
- [ ] API key authentication working for all mobile endpoints
- [ ] Company data isolation verified (no cross-company data leaks)
- [ ] First responder location tracking with <5 second update latency
- [ ] Dynamic event type creation and approval workflow
- [ ] Real-time updates delivered to correct company channels

### User Experience Goals  
- [ ] First responder login time <10 seconds
- [ ] Event submission with auto-type creation <30 seconds
- [ ] Live location tracking accuracy within 10 meters
- [ ] Company admin can see only their organization's data
- [ ] New event types auto-approved within 1 hour (configurable)

### Performance Targets
- [ ] API key validation <50ms
- [ ] Company-filtered queries <200ms
- [ ] Location ping processing <100ms
- [ ] WebSocket message delivery <2 seconds
- [ ] Support for 100+ concurrent first responders per company

---

## 🔒 Security Considerations

### API Key Security
- **Rotation**: Automated monthly rotation with grace period
- **Rate Limiting**: Per-company API call limits
- **Encryption**: All API keys encrypted at rest
- **Audit Logging**: All API key usage tracked

### Data Isolation
- **Query Filtering**: Automatic companyId filtering in all database queries
- **Index Strategy**: Compound indexes starting with companyId
- **Backup Isolation**: Company data backed up separately
- **GDPR Compliance**: Company-specific data deletion capabilities

### First Responder Privacy
- **Location Consent**: Explicit opt-in for location tracking
- **Shift-Based Tracking**: Only track during active shifts
- **Data Retention**: Location data auto-deleted after 30 days
- **Access Control**: Location data only visible to authorized personnel

---

## 📞 Next Steps & Action Items

### Immediate (This Week)
1. **Review and approve** this work plan with both teams
2. **Create company model** and API key generation logic
3. **Set up development environment** with multi-tenancy
4. **Update authentication middleware** for API keys
5. **Design database migration strategy** for existing data

### Week 1 Goals
1. Complete company onboarding and API key system
2. Implement first responder authentication
3. Add companyId to all existing collections
4. Create dynamic event type system
5. Set up company-scoped WebSocket channels

### Communication Schedule
- **Monday**: Joint team review of multi-tenant implementation
- **Wednesday**: Mobile integration testing and API validation  
- **Friday**: First responder workflow testing
- **Daily**: API changes and company isolation verification

This work plan provides a clear roadmap for implementing the standalone mobile app with multi-tenancy while maintaining your existing web dashboard functionality.