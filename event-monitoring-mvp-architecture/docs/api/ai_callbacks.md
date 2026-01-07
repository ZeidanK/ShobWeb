# AI Callbacks Documentation for Event Monitoring and Management Platform

## Overview

This document outlines the AI service callbacks for the Event Monitoring and Management Platform. It details how the AI service communicates with the backend API, including the expected payloads and response formats. This ensures a clear understanding of the integration points between the AI service and the backend, facilitating future modifications and expansions.

## AI Service Callbacks

### 1. Detection Event Callback

**Endpoint:** `POST /internal/ai/events`

**Description:** This endpoint is used by the AI service to send detection events to the backend API. Each detection event includes relevant information about the detected object, such as its type and location.

**Request Payload:**

```json
{
  "camera_id": "string",
  "timestamp": "ISO 8601 timestamp",
  "detection_type": "string", // e.g., "person", "vehicle"
  "coordinates": {
    "latitude": "float",
    "longitude": "float"
  },
  "confidence_score": "float"
}
```

**Response:**

- **Status Code:** `201 Created` if the event is successfully recorded.
- **Body:**

```json
{
  "event_id": "string",
  "message": "Event recorded successfully."
}
```

### 2. Error Handling Callback

**Endpoint:** `POST /internal/ai/errors`

**Description:** This endpoint is used to report any errors encountered by the AI service during processing. This helps in monitoring and debugging the AI service's performance.

**Request Payload:**

```json
{
  "error_type": "string", // e.g., "processing_error", "network_error"
  "timestamp": "ISO 8601 timestamp",
  "details": "string" // Detailed error message
}
```

**Response:**

- **Status Code:** `200 OK` if the error report is successfully received.
- **Body:**

```json
{
  "message": "Error reported successfully."
}
```

## Future Considerations

As the platform evolves, additional callbacks may be introduced to handle more complex interactions between the AI service and the backend API. This may include callbacks for batch processing results, status updates, or other relevant events that enhance the functionality and responsiveness of the system.