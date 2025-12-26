# Mobile App Integration API Documentation

This document describes the APIs available for mobile app integration with the Event Monitoring Platform.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Endpoints](#endpoints)
   - [Validate Company API Key](#1-validate-company-api-key)
   - [Verify First Responder](#2-verify-first-responder)
   - [Get Event Types](#3-get-event-types)
   - [Submit Report](#4-submit-report)
   - [Get My Reports](#5-get-my-reports)
   - [Get Report by ID](#6-get-report-by-id)
4. [Error Codes](#error-codes)
5. [Integration Flows](#integration-flows)

---

## Authentication

All API requests require authentication using an API Key provided by the WEB team.

### Required Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your unique company API key |
| `Content-Type` | Yes (for POST) | `application/json` |

### Example Headers

```
X-API-Key: your_company_api_key_here
Content-Type: application/json
```

---

## Base URL

```
Development: http://localhost:5000/api/mobile
Production:  https://api.yourserver.com/api/mobile
```

---

## Endpoints

### 1. Validate Company API Key

Validates that your API credentials are correct. Use this to verify your integration is working.

**Endpoint:** `POST /api/mobile/auth/company-validate`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |

**Request Body:** None required

**Success Response (200):**

```json
{
  "valid": true,
  "company": {
    "id": "company_001",
    "name": "Demo Company",
    "settings": {}
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Missing X-API-Key header"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/mobile/auth/company-validate \
  -H "X-API-Key: your_api_key"
```

**JavaScript Example:**

```javascript
const response = await fetch('http://localhost:5000/api/mobile/auth/company-validate', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const data = await response.json();
console.log(data);
// { valid: true, company: { id: "company_001", name: "Demo Company" } }
```

---

### 2. Verify First Responder

Checks if a phone number belongs to a registered First Responder in our system.

**Use Case:** When a user logs in to your app, first check your own database. If user not found, call this API to check if they are a First Responder managed by our system.

**Endpoint:** `POST /api/mobile/auth/verify-fr`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |
| `Content-Type` | Yes | `application/json` |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | Phone number with country code |

**Request Example:**

```json
{
  "phone": "+972-50-123-4567"
}
```

**Success Response - FR Found (200):**

```json
{
  "isFR": true,
  "frId": "fr_001",
  "name": "David Cohen",
  "role": "Paramedic"
}
```

**Success Response - FR Not Found (200):**

```json
{
  "isFR": false
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Phone number is required"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/mobile/auth/verify-fr \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+972-50-123-4567"}'
```

**JavaScript Example:**

```javascript
const response = await fetch('http://localhost:5000/api/mobile/auth/verify-fr', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '+972-50-123-4567'
  })
});

const data = await response.json();

if (data.isFR) {
  console.log(`First Responder: ${data.name}, Role: ${data.role}`);
} else {
  console.log('Not a First Responder');
}
```

---

### 3. Get Event Types

Returns available event types for report submission. Use this to populate dropdown menus in your app.

**Endpoint:** `GET /api/mobile/event-types`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |

**Request Body:** None

**Success Response (200):**

```json
{
  "eventTypes": [
    { "id": "et_001", "name": "Fire", "severity": "critical" },
    { "id": "et_002", "name": "Medical Emergency", "severity": "high" },
    { "id": "et_003", "name": "Security Incident", "severity": "medium" },
    { "id": "et_004", "name": "Traffic Accident", "severity": "high" },
    { "id": "et_005", "name": "Suspicious Activity", "severity": "low" }
  ]
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/mobile/event-types \
  -H "X-API-Key: your_api_key"
```

**JavaScript Example:**

```javascript
const response = await fetch('http://localhost:5000/api/mobile/event-types', {
  method: 'GET',
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const data = await response.json();
console.log(data.eventTypes);
// Use to populate dropdown in your app
```

---

### 4. Submit Report

Submits an incident report from the mobile app. The system automatically identifies the reporter as First Responder (FR) or Civilian based on their phone number.

**Endpoint:** `POST /api/mobile/reports`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |
| `Content-Type` | Yes | `application/json` |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | Reporter's phone number |
| `type` | string | Yes | Event type (English only) |
| `subType` | string | No | Event sub-type (English only) |
| `severity` | string | Yes | Severity level (English only) |
| `description` | string | No | Description of the incident |
| `location` | object | Yes | GPS coordinates |
| `location.latitude` | number | Yes | Latitude (-90 to 90) |
| `location.longitude` | number | Yes | Longitude (-180 to 180) |
| `media` | object | No | Attached media files |
| `media.images` | string[] | No | Array of image URLs |
| `media.videos` | string[] | No | Array of video URLs |

**Taxonomy Values (type, subType, severity):**

- Send values as English strings
- If you send an unknown value, our system will auto-add it (no error)
- Common examples:

| Field | Example Values |
|-------|----------------|
| `type` | `Fire`, `Medical Emergency`, `Security Incident`, `Traffic Accident` |
| `subType` | `Building Fire`, `Car Accident`, `Theft`, `Assault` |
| `severity` | `low`, `medium`, `high`, `critical`, `emergency` |

**Request Example:**

```json
{
  "phone": "+972-50-123-4567",
  "type": "Fire",
  "subType": "Building Fire",
  "severity": "critical",
  "description": "Smoke coming from 3rd floor window",
  "location": {
    "latitude": 32.0853,
    "longitude": 34.7818
  },
  "media": {
    "images": [
      "https://storage.example.com/img1.jpg",
      "https://storage.example.com/img2.jpg"
    ],
    "videos": []
  }
}
```

**Success Response (201):**

```json
{
  "success": true,
  "reportId": "rpt_1703520000000",
  "reporterType": "FR"
}
```

| Field | Description |
|-------|-------------|
| `success` | `true` if report was saved |
| `reportId` | Unique ID for this report |
| `reporterType` | `"FR"` (First Responder) or `"CIVILIAN"` |

**Error Response (400):**

```json
{
  "success": false,
  "message": "Missing required fields: phone, type, and location are required"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/mobile/reports \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+972-50-123-4567",
    "type": "Fire",
    "subType": "Building Fire",
    "severity": "critical",
    "description": "Smoke coming from 3rd floor window",
    "location": {
      "latitude": 32.0853,
      "longitude": 34.7818
    }
  }'
```

**JavaScript Example:**

```javascript
const report = {
  phone: '+972-50-123-4567',
  type: 'Fire',
  subType: 'Building Fire',
  severity: 'critical',
  description: 'Smoke coming from 3rd floor window',
  location: {
    latitude: 32.0853,
    longitude: 34.7818
  },
  media: {
    images: ['https://storage.example.com/img1.jpg'],
    videos: []
  }
};

const response = await fetch('http://localhost:5000/api/mobile/reports', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(report)
});

const data = await response.json();

if (data.success) {
  console.log(`Report created: ${data.reportId}`);
  console.log(`Reporter type: ${data.reporterType}`);
} else {
  console.error(`Error: ${data.message}`);
}
```

---

### 5. Get My Reports

Returns the user's own submitted reports with optional filtering and pagination.

**Endpoint:** `GET /api/mobile/reports/my`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Filter by date (YYYY-MM-DD) |
| `status` | string | No | Filter by status (pending, acknowledged, resolved, etc.) |
| `type` | string | No | Filter by event type |
| `severity` | string | No | Filter by severity |
| `limit` | number | No | Number of results (default: 50) |
| `offset` | number | No | Offset for pagination (default: 0) |

**Request Example:**

```
GET /api/mobile/reports/my?status=pending&severity=high&limit=20
```

**Success Response (200):**

```json
{
  "reports": [
    {
      "id": "rpt_001",
      "type": "Fire",
      "subType": "Building Fire",
      "severity": "critical",
      "status": "pending",
      "description": "Smoke coming from building",
      "location": {
        "latitude": 32.0853,
        "longitude": 34.7818
      },
      "createdAt": "2024-12-26T10:30:00.000Z"
    },
    {
      "id": "rpt_002",
      "type": "Medical Emergency",
      "severity": "high",
      "status": "acknowledged",
      "description": "Person collapsed on street",
      "location": {
        "latitude": 32.0900,
        "longitude": 34.7750
      },
      "createdAt": "2024-12-26T09:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:5000/api/mobile/reports/my?status=pending&limit=20" \
  -H "X-API-Key: your_api_key"
```

**JavaScript Example:**

```javascript
const params = new URLSearchParams({
  status: 'pending',
  limit: '20'
});

const response = await fetch(`http://localhost:5000/api/mobile/reports/my?${params}`, {
  method: 'GET',
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const data = await response.json();
console.log(`Found ${data.pagination.total} reports`);
data.reports.forEach(report => {
  console.log(`${report.id}: ${report.type} - ${report.status}`);
});
```

---

### 6. Get Report by ID

Returns detailed information for a specific report. Users can only view their own reports.

**Endpoint:** `GET /api/mobile/reports/:id`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your company API key |

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The report ID |

**Success Response (200):**

```json
{
  "report": {
    "id": "rpt_001",
    "type": "Fire",
    "subType": "Building Fire",
    "severity": "critical",
    "status": "pending",
    "description": "Smoke coming from building on 3rd floor",
    "location": {
      "latitude": 32.0853,
      "longitude": 34.7818
    },
    "media": {
      "images": ["https://example.com/img1.jpg"],
      "videos": []
    },
    "reporterType": "FR",
    "createdAt": "2024-12-26T10:30:00.000Z",
    "updatedAt": "2024-12-26T10:30:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Report ID is required"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Report not found"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/mobile/reports/rpt_001 \
  -H "X-API-Key: your_api_key"
```

**JavaScript Example:**

```javascript
const reportId = 'rpt_001';

const response = await fetch(`http://localhost:5000/api/mobile/reports/${reportId}`, {
  method: 'GET',
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const data = await response.json();
console.log(data.report);
```

---

## Error Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Report was created successfully |
| `400` | Bad Request | Missing or invalid fields in request body |
| `401` | Unauthorized | Missing or invalid API key |
| `403` | Forbidden | User doesn't have permission to access resource |
| `404` | Not Found | Resource not found |
| `500` | Server Error | Internal server error |

### Common Error Responses

**Missing API Key (401):**

```json
{
  "success": false,
  "message": "Missing X-API-Key header"
}
```

**Invalid API Key (401):**

```json
{
  "success": false,
  "message": "Invalid API key"
}
```

**Missing Required Fields (400):**

```json
{
  "success": false,
  "message": "Missing required fields: phone, type, and location are required"
}
```

---

## Integration Flows

### Login Flow

```
1. User enters phone number in your app
2. Check your own database for the user
3. If NOT found → Call POST /api/mobile/auth/verify-fr
4. If isFR: true → User is a First Responder, show FR features
5. If isFR: false → User is a Civilian, show civilian features
```

### Report Submission Flow

```
1. User fills out incident report in your app
2. Get GPS location from device
3. Upload any media to your storage (get URLs)
4. Call POST /api/mobile/reports with all data
5. Save the reportId for reference
6. Show confirmation to user with reportId
```

### Viewing Reports Flow

```
1. Call GET /api/mobile/reports/my to get list
2. Display reports in a list view
3. User taps on a report → Call GET /api/mobile/reports/:id
4. Display full report details
```

---

## Support

For API key requests or technical issues, contact the WEB team.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-26 | Initial API documentation (DEV-14) |
