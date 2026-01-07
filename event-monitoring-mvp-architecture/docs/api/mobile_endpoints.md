# DEV-13: Mobile API Implementation
**Implementation Summary for Approval**  
Mobile App Integration Project

## Overview
DEV-13 creates mobile-optimized APIs that integrate with our existing multi-tenant, permission-based architecture. These APIs enable the Mobile team to authenticate users, submit events, and retrieve dynamic event types while maintaining consistency with our current system design.

## APIs to Build

| API | Purpose | Request | Response |
|-----|---------|---------|----------|
| `POST /api/mobile/auth/company-validate` | Validate company API credentials | Headers: `X-API-Key`, `X-Company-ID` | `{ valid, company: { id, name, settings } }` |
| `POST /api/mobile/auth/first-responder` | Authenticate First Responder via existing JWT system | `{ username, password }` + Header: `X-API-Key` | `{ success, token, user: { id, username, role } }` |
| `POST /api/mobile/auth/anonymous-session` | Create anonymous session for civilians | `{ deviceInfo: { platform, version, deviceId } }` + Header: `X-API-Key` | `{ success, sessionToken, deviceId }` |
| `GET /api/mobile/event-types` | Retrieve dynamic event types for company | Headers: `X-API-Key`, `Authorization: Bearer <token>` | `{ eventTypes: [{ id, name, severity }] }` |
| `POST /api/mobile/reports` | Submit incident reports using Report model | `{ type, subType, severity, description, location, media? }` + Headers: `X-API-Key`, `Authorization` | `{ success, reportId, status }` |
| `GET /api/mobile/reports/my` | Retrieve user's own submitted reports only | Headers: `X-API-Key`, `Authorization` + Query: `?date=2024-12-26&status=new&limit=50` | `{ reports: [{ id, type, severity, status, timestamp }] }` |
| `GET /api/mobile/reports/{id}` | Get specific report details (own reports only) | Headers: `X-API-Key`, `Authorization` | `{ report: { id, type, description, location, media, status } }` |

## Files to Modify (Leveraging Existing Architecture)

| File | Purpose |
|------|---------|
| `src/routes/auth.ts` | Add mobile authentication endpoints |
| `src/controllers/authController.ts` | Add mobile-specific auth handlers |
| `src/routes/reports.ts` | Add mobile report submission and retrieval endpoints |
| `src/controllers/reportController.ts` | Add mobile report handlers |
| `src/routes/events.ts` | Add mobile event retrieval endpoints |
| `src/controllers/eventController.ts` | Add mobile event retrieval handlers |
| `src/middleware/auth.ts` | Add mobile API key validation |
| `src/types/index.ts` | Extend existing interfaces for mobile responses |

## Technical Sync Document Coverage

This implementation addresses the WEB-App technical sync requirements while maintaining architectural consistency:

| Section | Requirement | Covered By |
|---------|-------------|------------|
| 1 | Check if user is First Responder | `POST /auth/first-responder` |
| 3 | Receive reports with dynamic event types | `POST /reports` + `GET /event-types` |
| 4 | Identify reporter type | Authentication middleware logic |
| 5 | Validate API Key per company | Company-scoped API key middleware |
| 5 | Multi-tenancy support | Company-based API key validation |
| - | View user's own reports only | `GET /reports/my` with user-scoped access |

## API Details

### 1. POST /api/mobile/auth/company-validate
**Purpose:** Validate company API credentials and retrieve company settings

**Request Headers:**
```
X-API-Key: <company_api_key>
X-Company-ID: <company_id>
```

**Response:**
```json
{
  "valid": true,
  "company": {
    "id": "comp_001",
    "name": "City Emergency Services",
    "settings": {
      "allowAnonymousReports": true,
      "requiredEventFields": ["location", "eventType"]
    }
  }
}
```

### 2. POST /api/mobile/auth/first-responder
**Purpose:** Authenticate First Responder using existing JWT system

**Request Headers:**
```
X-API-Key: <company_api_key>
```

**Request Body:**
```json
{
  "username": "john.doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_001",
    "username": "john.doe",
    "role": "operator"
  }
}
```

### 3. POST /api/mobile/auth/anonymous-session
**Purpose:** Create anonymous session for civilian reporters

**Request Headers:**
```
X-API-Key: <company_api_key>
```

**Request Body:**
```json
{
  "deviceInfo": {
    "platform": "iOS",
    "version": "1.0.0",
    "deviceId": "unique_device_identifier"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "temp_session_token",
  "deviceId": "device_001",
  "expiresIn": 3600
}
```

### 4. GET /api/mobile/event-types
**Purpose:** Retrieve dynamic event types configured for the company

**Request Headers:**
```
X-API-Key: <company_api_key>
Authorization: Bearer <token_or_session_token>
```

**Response:**
```json
{
  "eventTypes": [
    {
      "id": "person_detected",
      "name": "Person Detected",
      "severity": "low"
    },
    {
      "id": "suspicious_behavior", 
      "name": "Suspicious Behavior",
      "severity": "medium"
    },
    {
      "id": "abandoned_object",
      "name": "Abandoned Object", 
      "severity": "high"
    }
  ]
}
```

### 5. POST /api/mobile/reports
**Purpose:** Submit incident reports using Report model structure

**Request Headers:**
```
X-API-Key: <company_api_key>
Authorization: Bearer <token_or_session_token>
```

**Request Body:**
```json
{
  "type": "FIRE",
  "subType": "FOREST",
  "severity": "HIGH",
  "description": "Large forest fire spreading rapidly",
  "location": {
    "latitude": 32.0853,
    "longitude": 34.7818
  },
  "media": {
    "images": ["base64_encoded_image_1", "base64_encoded_image_2"],
    "videos": ["base64_encoded_video"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt_abc123",
  "status": "new",
  "reporterType": "FR"
}
```

### 6. GET /api/mobile/reports/my
**Purpose:** Retrieve user's own submitted reports only (security: user can only see their own data)

**Request Headers:**
```
X-API-Key: <company_api_key>
Authorization: Bearer <token_or_session_token>
```

**Query Parameters:**
```
?date=2024-12-26&dateFrom=2024-12-01&dateTo=2024-12-31&status=new&type=FIRE&severity=HIGH&limit=50&offset=0&sortBy=timestamp&sortOrder=desc
```

**Available Filters:**
- `date`: Specific date (YYYY-MM-DD)
- `dateFrom` / `dateTo`: Date range filter
- `status`: Filter by status (`new`, `acknowledged`, `resolved`, `closed`)
- `type`: Filter by report type (`FIRE`, `MEDICAL`, `POLICE`, etc.)
- `severity`: Filter by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `limit`: Number of results to return (default: 20, max: 100)
- `offset`: Pagination offset
- `sortBy`: Sort field (`timestamp`, `severity`, `status`)
- `sortOrder`: Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "reports": [
    {
      "id": "rpt_abc123",
      "type": "FIRE",
      "subType": "FOREST",
      "severity": "HIGH",
      "status": "acknowledged",
      "timestamp": "2024-12-26T10:30:00Z",
      "location": {
        "latitude": 32.0853,
        "longitude": 34.7818
      },
      "lastUpdated": "2024-12-26T10:45:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "summary": {
    "totalByStatus": {
      "new": 3,
      "acknowledged": 8,
      "resolved": 4,
      "closed": 0
    },
    "totalBySeverity": {
      "LOW": 2,
      "MEDIUM": 5,
      "HIGH": 7,
      "CRITICAL": 1
    }
  }
}
```

### 7. GET /api/mobile/reports/{id}
**Purpose:** Get detailed information for a specific report (security: only own reports or reports assigned to user)

**Request Headers:**
```
X-API-Key: <company_api_key>
Authorization: Bearer <token_or_session_token>
```

**Security Rules:**
- First Responders: Can view reports they submitted or reports assigned to them
- Anonymous users: Can only view reports they submitted during their session
- Returns 404 if report doesn't belong to user

**Response:**
```json
{
  "report": {
    "id": "rpt_abc123",
    "type": "FIRE",
    "subType": "FOREST",
    "severity": "HIGH",
    "description": "Large forest fire spreading rapidly",
    "location": {
      "latitude": 32.0853,
      "longitude": 34.7818
    },
    "media": {
      "images": ["base64_encoded_image_1"],
      "videos": ["base64_encoded_video"]
    },
    "status": "acknowledged",
    "timestamp": "2024-12-26T10:30:00Z",
    "submittedBy": "user_001",
    "assignedTo": "user_002",
    "lastUpdated": "2024-12-26T10:45:00Z",
    "statusHistory": [
      {
        "status": "new",
        "timestamp": "2024-12-26T10:30:00Z",
        "changedBy": "system"
      },
      {
        "status": "acknowledged",
        "timestamp": "2024-12-26T10:45:00Z", 
        "changedBy": "user_002",
        "comment": "Emergency crews dispatched"
      }
    ]
  }
}
```

## Authentication Middleware Integration

### Company API Key Validation
Extends existing `src/middleware/auth.ts` to validate company-specific API keys:
```typescript
export const validateMobileApiKey = (req, res, next) => {
  // Validate X-API-Key against Company.apiKey
  // Set req.company for downstream use
  // Ensure company is active
}

export const validateMobileUserAccess = (req, res, next) => {
  // Ensure user can only access their own reports
  // For FR: reports they submitted OR reports assigned to them
  // For Anonymous: reports from their session only
}
```

### Role-Based Access
Leverages existing User model roles with mobile-specific restrictions:
- `admin`: Can view reports they submitted (mobile access is limited even for admins)
- `operator`: Can view reports they submitted or assigned to them
- `anonymous`: Can only view reports from their current session
- **Security**: NO access to camera-detected events (that's web dashboard only)
- **Scope**: Users only see their own data, never company-wide data

## Integration with Existing Models

This implementation extends our current type definitions in `src/types/index.ts`:

```typescript
// Mobile-specific response interfaces
export interface MobileAuthResponse {
  success: boolean;
  token?: string;
  sessionToken?: string;
  user?: Pick<User, 'id' | 'username' | 'role'>;
}

export interface MobileReportRequest {
  type: string;
  subType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location: Camera['location'];
  media?: {
    images?: string[];
    videos?: string[];
  };
}

export interface MobileEventResponse {
  events: Array<Pick<Event, 'id' | 'eventType' | 'cameraId' | 'timestamp' | 'status'> & {
    cameraName: string;
    location: Camera['location'];
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

## Implementation Steps for Web Backend

### Phase 1: Core Infrastructure
1. **Extend Type Definitions**
   - Add mobile-specific interfaces to `src/types/index.ts`
   - Add Company model with `apiKey` field
   - Add anonymous session types

2. **Update Authentication Middleware**
   - Modify `src/middleware/auth.ts` to support company API key validation
   - Add mobile-specific authentication handlers
   - Implement session management for anonymous users

3. **Database Schema Updates**
   - Add `apiKey` field to Company model
   - Add anonymous session storage
   - Update User model for mobile authentication

### Phase 2: API Implementation
4. **Authentication Endpoints**
   - Implement `POST /api/mobile/auth/company-validate` in `src/routes/auth.ts`
   - Implement `POST /api/mobile/auth/first-responder` in `src/controllers/authController.ts`
   - Implement `POST /api/mobile/auth/anonymous-session` for civilian access

5. **Report Management Endpoints**
   - Implement `GET /api/mobile/event-types` in `src/routes/events.ts`
   - Implement `POST /api/mobile/reports` in `src/controllers/reportController.ts`
   - Implement `GET /api/mobile/reports/my` with user-scoped filtering
   - Implement `GET /api/mobile/reports/{id}` with ownership validation
   - Add comprehensive filtering (date ranges, status, type, severity)
   - Add pagination and sorting capabilities

### Phase 3: Testing & Documentation
6. **API Testing**
   - Create unit tests for all mobile endpoints
   - Test company isolation and API key validation
   - Verify existing web functionality remains intact

7. **API Documentation**
   - Update OpenAPI/Swagger documentation
   - Create mobile integration guide
   - Document authentication flows

## Benefits of This Approach

- ✅ Leverages existing authentication system
- ✅ Maintains multi-tenant company isolation  
- ✅ Uses current Event and User models
- ✅ Consistent with existing API patterns
- ✅ No parallel systems or data duplication
- ✅ Mobile team gets clear API specification for development

## Mobile Team Integration

Once the web backend implementation is complete, the mobile team can:

1. **Use the API specification above** to build their integration
2. **Test against fake responses** during development (DEV-15 will provide real data)
3. **Follow the authentication flows** outlined in this document
4. **Submit incident reports using the Report model** structure  
5. **Retrieve only their own submitted reports** (with comprehensive filtering)
6. **Implement pagination and date filtering** for report history
7. **Handle different user types** (First Responders vs Anonymous sessions)
8. **Respect security boundaries** (no access to camera events or other users' data)

This implementation ensures the mobile APIs integrate seamlessly with our existing architecture while providing clear specifications for the mobile development team.