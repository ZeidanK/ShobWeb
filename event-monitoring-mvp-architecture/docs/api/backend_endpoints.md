# Backend API Endpoints for Event Monitoring and Management Platform

This document outlines the backend API endpoints for the Event Monitoring and Management Platform MVP. Each endpoint includes the route, HTTP method, description, and expected responses.

**Mobile Integration Note**: Mobile users authenticate through their own app. This backend only receives event submissions from mobile users, not their authentication data.

## Authentication (Web Users Only)

### POST /api/auth/register
- **Description**: Register a new web application user (operators, admins).
- **Note**: Citizens register through mobile app - not stored in this database
- **Request Body**:
  - `email`: string (required)
  - `password`: string (required) 
  - `username`: string (optional)
  - `roles`: array (optional, defaults to ["operator"])
  - `authMethod`: string (default: "email")
  - `profile`: object (firstName, lastName, etc.)
- **Responses**:
  - **201 Created**: Returns user object and JWT token.
  - **400 Bad Request**: Invalid input or missing required fields.
  - **409 Conflict**: User already exists.

### POST /api/auth/login
- **Description**: Authenticate web user with email and password.
- **Request Body**:
  - `email`: string (email address)
  - `password`: string
- **Responses**:
  - **200 OK**: Returns JWT token and user profile.
  - **401 Unauthorized**: Invalid credentials.

### PUT /api/auth/change-password
- **Description**: Change user password.
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  - `currentPassword`: string
  - `newPassword`: string
- **Responses**:
  - **200 OK**: Password changed successfully.
  - **401 Unauthorized**: Invalid current password.

## Cameras

### GET /cameras
- **Description**: Retrieves a list of all cameras.
- **Responses**:
  - **200 OK**: Returns an array of camera objects.
    - Example:
      ```json
      [
        {
          "camera_id": "1",
          "name": "Main Entrance",
          "location": {
            "lat": 34.0522,
            "lon": -118.2437
          },
          "stream_url": "rtsp://example.com/stream1"
        }
      ]
      ```

### GET /cameras/{id}
- **Description**: Retrieves details of a specific camera by ID.
- **Responses**:
  - **200 OK**: Returns the camera object.
  - **404 Not Found**: Camera not found.

## Events (Enhanced)

### GET /api/events
- **Description**: Retrieves events with advanced filtering and mobile support.
- **Headers**: Authorization: Bearer {token} (optional for public events)
- **Query Parameters**:
  - `status`: string (optional, e.g., "new", "investigating", "resolved")
  - `eventType`: ObjectId (optional, EventType reference)
  - `type`: string (optional, legacy support)
  - `camera_id`: string (optional)
  - `submittedBy`: ObjectId (optional, filter by submitter)
  - `isAnonymous`: boolean (optional)
  - `start_time`: string (optional, ISO format)
  - `end_time`: string (optional, ISO format)
  - `severity`: string (optional, "low", "medium", "high", "critical")
  - `page`: number (optional, default: 1)
  - `limit`: number (optional, default: 20)
- **Responses**:
  - **200 OK**: Returns paginated array of event objects.

### GET /api/events/{id}
- **Description**: Retrieves details of a specific event by ID.
- **Headers**: Authorization: Bearer {token}
- **Responses**:
  - **200 OK**: Returns the event object with EventType details.
  - **404 Not Found**: Event not found.
  - **403 Forbidden**: Access denied (for private events).

### POST /api/events
- **Description**: Creates a new event (authenticated users).
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  - `eventType`: ObjectId (reference to EventType)
  - `description`: string
  - `location`: object (lat, lon, address)
  - `severity`: string ("low", "medium", "high", "critical")
  - `cameraId`: ObjectId (optional)
  - `media`: array (optional, media file URLs)
  - `customFields`: object (optional, EventType-specific fields)
  - `isAnonymous`: boolean (optional, default: false)
- **Responses**:
  - **201 Created**: Returns the created event object.
  - **400 Bad Request**: Invalid input data.

### PUT /api/events/{id}/status
- **Description**: Update event status (operators/admins only).
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  - `status`: string ("investigating", "resolved", "dismissed")
  - `resolution`: string (optional, resolution notes)
  - `assignedTo`: ObjectId (optional, assign to user)
- **Responses**:
  - **200 OK**: Event status updated.
  - **403 Forbidden**: Insufficient permissions.

## Mobile API (Event Submission Only)

### POST /api/mobile/events
- **Description**: Submit event from mobile app (mobile users authenticate in their app).
- **Headers**: X-Mobile-Auth-Token: {mobile_app_token} (mobile app handles citizen auth)
- **Request Body**:
  - `eventType`: ObjectId or string (EventType reference or name)
  - `description`: string
  - `location`: object (lat, lon, address)
  - `media`: array (optional, base64 encoded or file URLs)
  - `isAnonymous`: boolean (default: false)
  - `submitterInfo`: object (optional, from mobile app if user consents)
    - `mobileUserId`: string (mobile app's user ID)
    - `deviceInfo`: object
  - `offlineId`: string (optional, for offline sync)
- **Responses**:
  - **201 Created**: Event submitted successfully.
  - **400 Bad Request**: Invalid data.

### GET /api/mobile/events/types
- **Description**: Get public EventTypes for mobile selection (no auth required).
- **Query Parameters**:
  - `category`: string (optional, filter by category)
  - `isActive`: boolean (default: true)
- **Responses**:
  - **200 OK**: Returns array of public EventType objects.

## EventTypes Management

### GET /api/event-types
- **Description**: List all EventTypes (admin/mobile_admin only).
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `isActive`: boolean (optional)
  - `category`: string (optional)
  - `parentType`: ObjectId (optional, get subtypes)
- **Responses**:
  - **200 OK**: Returns array of EventType objects.

### POST /api/event-types
- **Description**: Create new EventType (mobile_admin only).
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  - `name`: string
  - `category`: string
  - `description`: string (optional)
  - `parentType`: ObjectId (optional)
  - `isPublic`: boolean (default: true)
  - `allowedRoles`: array (default: ["citizen", "operator", "admin"])
  - `fields`: array (optional, custom field definitions)
- **Responses**:
  - **201 Created**: EventType created.
  - **403 Forbidden**: Insufficient permissions.

### PUT /api/event-types/{id}
- **Description**: Update EventType (mobile_admin only).
- **Headers**: Authorization: Bearer {token}
- **Responses**:
  - **200 OK**: EventType updated.
  - **403 Forbidden**: Insufficient permissions.

### DELETE /api/event-types/{id}
- **Description**: Soft delete EventType (mobile_admin only).
- **Headers**: Authorization: Bearer {token}
- **Responses**:
  - **200 OK**: EventType deactivated.
  - **403 Forbidden**: Insufficient permissions.

## Video Stream

### GET /cameras/{id}/stream
- **Description**: Retrieves the stream URL for a specific camera.
- **Responses**:
  - **200 OK**: Returns the stream URL.
  - **404 Not Found**: Camera not found.

## AI Integration

### POST /internal/ai/events
- **Description**: Receives detection results from the AI service.
- **Request Body**:
  - `camera_id`: string
  - `timestamp`: string (ISO format)
  - `detection_type`: string (e.g., "person", "vehicle")
  - `confidence`: number
- **Responses**:
  - **200 OK**: Event created successfully.
  - **400 Bad Request**: Invalid input data.

This document serves as a reference for developers to implement and utilize the backend API endpoints effectively.