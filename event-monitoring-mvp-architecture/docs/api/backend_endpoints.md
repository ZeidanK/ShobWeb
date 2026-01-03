# Backend API Endpoints for Event Monitoring and Management Platform

This document outlines the backend API endpoints for the Event Monitoring and Management Platform. The API supports multi-tenant operation with company isolation, mobile citizen reporting, first responder tracking, and dynamic event types.

**Authentication Overview**:
- **Web Dashboard**: JWT-based authentication for operators, admins, and company admins
- **Mobile Apps**: API key validation for company access, separate mobile authentication
- **First Responders**: Phone/password authentication with API key validation
- **Multi-Tenant**: All endpoints are company-scoped via API keys or user company association

## Authentication Endpoints

### POST /api/auth/register
- **Description**: Register a new web dashboard user (operators, admins, company_admins).
- **Headers**: X-API-Key: {company_api_key} (required for company-scoped registration)
- **Request Body**:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)",
    "username": "string (optional)",
    "firstName": "string (required)",
    "lastName": "string (required)",
    "role": "string (optional, default: 'operator')"
  }
  ```
- **Responses**:
  - **201 Created**: Returns user object and JWT token
  - **400 Bad Request**: Invalid input or missing required fields
  - **409 Conflict**: User already exists
  - **403 Forbidden**: Invalid API key or insufficient permissions

### POST /api/auth/login
- **Description**: Authenticate web dashboard user with email/password.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - **200 OK**: Returns JWT token and user profile
  - **401 Unauthorized**: Invalid credentials

### POST /api/auth/first-responder/login
- **Description**: Authenticate first responder with phone/password.
- **Headers**: X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "phone": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - **200 OK**: Returns JWT token and user profile with location tracking enabled
  - **401 Unauthorized**: Invalid credentials or API key

### POST /api/auth/validate-api-key
- **Description**: Validate company API key for mobile app access.
- **Headers**: X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: API key is valid, returns company info
  - **401 Unauthorized**: Invalid API key

## Company Management Endpoints

### GET /api/companies
- **Description**: List companies (super_admin only).
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `status`: string (optional: "active", "suspended")
  - `plan`: string (optional: "basic", "professional", "enterprise")
- **Responses**:
  - **200 OK**: Returns paginated array of company objects
  - **403 Forbidden**: Insufficient permissions

### POST /api/companies
- **Description**: Create new company (super_admin only).
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "description": "string (optional)",
    "contact": {
      "email": "string",
      "phone": "string",
      "address": "object"
    },
    "subscription": {
      "plan": "string",
      "maxUsers": "number",
      "maxCameras": "number"
    }
  }
  ```
- **Responses**:
  - **201 Created**: Returns company object with generated API key
  - **403 Forbidden**: Insufficient permissions

### GET /api/companies/{id}
- **Description**: Get company details (company_admin or super_admin).
- **Headers**: Authorization: Bearer {token}
- **Responses**:
  - **200 OK**: Returns company object
  - **403 Forbidden**: Access denied
  - **404 Not Found**: Company not found

### PUT /api/companies/{id}
- **Description**: Update company settings (company_admin or super_admin).
- **Headers**: Authorization: Bearer {token}
- **Request Body**: Partial company object
- **Responses**:
  - **200 OK**: Company updated
  - **403 Forbidden**: Insufficient permissions

### POST /api/companies/{id}/rotate-api-key
- **Description**: Generate new API key for company (company_admin or super_admin).
- **Headers**: Authorization: Bearer {token}
- **Responses**:
  - **200 OK**: Returns new API key
  - **403 Forbidden**: Insufficient permissions

## User Management Endpoints

### GET /api/users
- **Description**: List users in company (admin, company_admin, super_admin).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Query Parameters**:
  - `role`: string (optional filter)
  - `status`: string (optional: "active", "inactive")
  - `page`: number, `limit`: number
- **Responses**:
  - **200 OK**: Returns paginated array of user objects
  - **403 Forbidden**: Insufficient permissions

### POST /api/users
- **Description**: Create new user in company (admin, company_admin, super_admin).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "email": "string (optional for mobile-only)",
    "phone": "string (optional)",
    "username": "string (required)",
    "password": "string (required)",
    "firstName": "string (required)",
    "lastName": "string (required)",
    "role": "string (required)"
  }
  ```
- **Responses**:
  - **201 Created**: Returns user object
  - **403 Forbidden**: Insufficient permissions

### GET /api/users/{id}
- **Description**: Get user details.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns user object
  - **403 Forbidden**: Access denied
  - **404 Not Found**: User not found

### PUT /api/users/{id}
- **Description**: Update user (admin, company_admin, super_admin, or self).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**: Partial user object
- **Responses**:
  - **200 OK**: User updated
  - **403 Forbidden**: Insufficient permissions

## Event Endpoints

### GET /api/events
- **Description**: List events with filtering and pagination.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Query Parameters**:
  - `status`: string (optional: "active", "resolved", "closed")
  - `priority`: string (optional: "low", "medium", "high", "critical")
  - `eventTypeId`: ObjectId (optional)
  - `assignedTo`: ObjectId (optional)
  - `startDate`: ISO string (optional)
  - `endDate`: ISO string (optional)
  - `page`: number, `limit`: number
- **Responses**:
  - **200 OK**: Returns paginated array of event objects with report counts
  - **403 Forbidden**: Invalid API key

### GET /api/events/{id}
- **Description**: Get detailed event information.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns event object with related reports and event type details
  - **403 Forbidden**: Access denied
  - **404 Not Found**: Event not found

### POST /api/events
- **Description**: Create new event (operators and above).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "eventTypeId": "ObjectId (required)",
    "title": "string (required)",
    "description": "string (optional)",
    "priority": "string (optional)",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "address": "string (optional)",
    "assignedTo": "ObjectId (optional)",
    "tags": ["string"] (optional)
  }
  ```
- **Responses**:
  - **201 Created**: Returns created event object
  - **400 Bad Request**: Invalid data
  - **403 Forbidden**: Insufficient permissions

### PUT /api/events/{id}
- **Description**: Update event (assigned user or admin).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**: Partial event object
- **Responses**:
  - **200 OK**: Event updated
  - **403 Forbidden**: Insufficient permissions

### GET /api/events/{id}/reports
- **Description**: Get all reports linked to an event.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns array of report objects
  - **403 Forbidden**: Access denied

## Report Endpoints

### GET /api/reports
- **Description**: List reports with filtering.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Query Parameters**:
  - `status`: string (optional: "submitted", "reviewed", "verified", "rejected")
  - `reportType`: string (optional)
  - `eventId`: ObjectId (optional)
  - `startDate`: ISO string (optional)
  - `endDate`: ISO string (optional)
  - `page`: number, `limit`: number
- **Responses**:
  - **200 OK**: Returns paginated array of report objects
  - **403 Forbidden**: Invalid API key

### GET /api/reports/{id}
- **Description**: Get detailed report information.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns report object with attachments
  - **403 Forbidden**: Access denied
  - **404 Not Found**: Report not found

### POST /api/mobile/reports
- **Description**: Submit report from mobile app (citizen or first responder).
- **Headers**: X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "reportType": "string (required: 'citizen', 'first_responder')",
    "title": "string (required)",
    "description": "string (required)",
    "eventTypeId": "ObjectId (required)",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "address": "string (optional)",
    "attachments": [{
      "type": "string ('image', 'video', 'audio')",
      "data": "string (base64)",
      "filename": "string"
    }] (optional),
    "metadata": {
      "deviceInfo": "object",
      "appVersion": "string"
    } (optional)
  }
  ```
- **Responses**:
  - **201 Created**: Returns created report object, may link to existing or new event
  - **400 Bad Request**: Invalid data
  - **403 Forbidden**: Invalid API key

### PUT /api/reports/{id}/status
- **Description**: Update report status (operators and above).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "status": "string",
    "reviewedBy": "ObjectId (auto-filled)"
  }
  ```
- **Responses**:
  - **200 OK**: Report status updated
  - **403 Forbidden**: Insufficient permissions

### POST /api/reports/{id}/link-event
- **Description**: Link report to an existing event or create new event from report.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "eventId": "ObjectId (optional - if null, creates new event)",
    "createEvent": "boolean (default: true)"
  }
  ```
- **Responses**:
  - **200 OK**: Report linked to event
  - **201 Created**: New event created and report linked
  - **403 Forbidden**: Insufficient permissions

## Camera Endpoints

### GET /api/cameras
- **Description**: List cameras in company.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Query Parameters**:
  - `status`: string (optional)
  - `page`: number, `limit`: number
- **Responses**:
  - **200 OK**: Returns paginated array of camera objects
  - **403 Forbidden**: Invalid API key

### GET /api/cameras/{id}
- **Description**: Get camera details.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns camera object with configuration
  - **403 Forbidden**: Access denied
  - **404 Not Found**: Camera not found

### POST /api/cameras
- **Description**: Register new camera (admin, company_admin).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "serialNumber": "string (required)",
    "model": "string (required)",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "address": "string (optional)",
    "streamUrl": "string (required)",
    "config": "object (optional)"
  }
  ```
- **Responses**:
  - **201 Created**: Returns camera object
  - **403 Forbidden**: Insufficient permissions

### PUT /api/cameras/{id}
- **Description**: Update camera configuration.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**: Partial camera object
- **Responses**:
  - **200 OK**: Camera updated
  - **403 Forbidden**: Insufficient permissions

### GET /api/cameras/{id}/stream
- **Description**: Get secure stream URL for camera.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns signed stream URL
  - **403 Forbidden**: Access denied

## Event Type Endpoints

### GET /api/event-types
- **Description**: List available event types (public and company-specific).
- **Headers**: Authorization: Bearer {token} (optional), X-API-Key: {company_api_key}
- **Query Parameters**:
  - `isPublic`: boolean (optional)
  - `category`: string (optional)
  - `parentId`: ObjectId (optional)
- **Responses**:
  - **200 OK**: Returns array of event type objects
  - **403 Forbidden**: Invalid API key

### POST /api/event-types
- **Description**: Create new event type (admin, company_admin, super_admin).
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "description": "string (optional)",
    "category": "string (required)",
    "parentId": "ObjectId (optional)",
    "isPublic": "boolean (default: true)",
    "priority": "string (default: 'medium')",
    "autoCreateEvent": "boolean (default: false)"
  }
  ```
- **Responses**:
  - **201 Created**: Returns event type object
  - **403 Forbidden**: Insufficient permissions

### PUT /api/event-types/{id}
- **Description**: Update event type.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Request Body**: Partial event type object
- **Responses**:
  - **200 OK**: Event type updated
  - **403 Forbidden**: Insufficient permissions

## Real-time Endpoints (WebSocket)

### WS /api/realtime/events
- **Description**: Real-time event updates and notifications.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Events**:
  - `event_created`: New event notification
  - `event_updated`: Event status/location changes
  - `report_submitted`: New report notification

### WS /api/realtime/location
- **Description**: First responder location tracking.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Events**:
  - `location_update`: Send current location
  - `responder_available`: Status updates

## AI Service Integration

### POST /internal/ai/detections
- **Description**: Receive AI detection results from camera service.
- **Headers**: X-API-Key: {company_api_key}
- **Request Body**:
  ```json
  {
    "cameraId": "ObjectId",
    "timestamp": "ISO string",
    "detections": [{
      "type": "string",
      "confidence": "number",
      "boundingBox": "object (optional)"
    }],
    "snapshotUrl": "string (optional)"
  }
  ```
- **Responses**:
  - **200 OK**: Detection processed, report/event created if threshold met
  - **400 Bad Request**: Invalid data

## Analytics Endpoints

### GET /api/analytics/events
- **Description**: Event analytics and reporting.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Query Parameters**:
  - `startDate`: ISO string
  - `endDate`: ISO string
  - `groupBy`: string ("day", "week", "month", "type")
- **Responses**:
  - **200 OK**: Returns analytics data
  - **403 Forbidden**: Insufficient permissions

### GET /api/analytics/performance
- **Description**: System performance metrics.
- **Headers**: Authorization: Bearer {token}, X-API-Key: {company_api_key}
- **Responses**:
  - **200 OK**: Returns performance metrics
  - **403 Forbidden**: Insufficient permissions

## Error Responses

All endpoints may return the following error responses:
- **400 Bad Request**: Invalid request data or parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions or invalid API key
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

- **Mobile Reports**: 100 requests per hour per API key
- **Web Dashboard**: 1000 requests per hour per user
- **Real-time**: Unlimited for active connections
- **AI Integration**: 1000 requests per minute per camera

This API documentation reflects the multi-tenant architecture with company isolation, flexible event types, and comprehensive mobile integration.