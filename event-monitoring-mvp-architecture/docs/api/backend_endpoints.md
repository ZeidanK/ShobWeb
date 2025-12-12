# Backend API Endpoints for Event Monitoring and Management Platform

This document outlines the backend API endpoints for the Event Monitoring and Management Platform MVP. Each endpoint includes the route, HTTP method, description, and expected responses.

## Authentication

### POST /auth/login
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  - `username`: string
  - `password`: string
- **Responses**:
  - **200 OK**: Returns a JWT token.
  - **401 Unauthorized**: Invalid credentials.

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

## Events

### GET /events
- **Description**: Retrieves a list of events, with optional filtering.
- **Query Parameters**:
  - `status`: string (optional, e.g., "active", "resolved")
  - `camera_id`: string (optional)
  - `start_time`: string (optional, ISO format)
  - `end_time`: string (optional, ISO format)
- **Responses**:
  - **200 OK**: Returns an array of event objects.
    - Example:
      ```json
      [
        {
          "event_id": "1",
          "timestamp": "2023-10-01T12:00:00Z",
          "camera_id": "1",
          "event_type": "person_detected",
          "snapshot_url": "http://example.com/snapshot1.jpg",
          "status": "new"
        }
      ]
      ```

### GET /events/{id}
- **Description**: Retrieves details of a specific event by ID.
- **Responses**:
  - **200 OK**: Returns the event object.
  - **404 Not Found**: Event not found.

### POST /events
- **Description**: Creates a new event (for internal use by AI service).
- **Request Body**:
  - `camera_id`: string
  - `event_type`: string
  - `snapshot_url`: string (optional)
- **Responses**:
  - **201 Created**: Returns the created event object.
  - **400 Bad Request**: Invalid input data.

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