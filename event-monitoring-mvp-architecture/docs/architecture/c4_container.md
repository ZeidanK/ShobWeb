# C4 Container Diagram for Event Monitoring and Management Platform

## Overview

This document outlines the C4 container diagram for the Event Monitoring and Management Platform MVP. It provides a high-level view of the system's containers, their responsibilities, and interactions. The architecture is designed to be modular and scalable, allowing for future enhancements and modifications.

## Containers

### 1. React Web Application
- **Description**: The frontend of the application that users interact with.
- **Responsibilities**:
  - User authentication and session management.
  - Display live video streams from cameras.
  - Show a list of events and their details.
  - Provide a map view with camera locations and active events.

### 2. Node.js Backend API
- **Description**: The server-side application that handles business logic and data management.
- **Responsibilities**:
  - Authenticate users and issue JWT tokens.
  - Serve camera data and event information to the frontend.
  - Handle incoming detection events from the AI service.
  - Interact with the MongoDB database for data storage and retrieval.

### 3. AI Analytics Service
- **Description**: A separate microservice responsible for processing video streams and detecting events.
- **Responsibilities**:
  - Analyze video feeds using AI models to detect people and vehicles.
  - Send detection results back to the Node.js backend API for event creation.

### 4. MongoDB Database
- **Description**: The database used for storing application data.
- **Responsibilities**:
  - Store user information, camera details, and event records.
  - Provide data persistence for the application.

### 5. External Systems
- **Description**: Systems that interact with the Event Monitoring Platform.
- **Responsibilities**:
  - IP Cameras or VMS: Provide live video streams to the application.
  - Map Provider: Supply map tiles and geolocation services for the frontend.

## Data Flows

1. **User Authentication Flow**:
   - User logs in via the React app.
   - Credentials are sent to the Node.js backend API.
   - The backend validates the credentials and returns a JWT token.

2. **Live Video Stream Flow**:
   - The React app requests video stream URLs from the Node.js backend API.
   - The backend retrieves stream information and sends it back to the frontend.
   - The frontend displays the live video using the provided URLs.

3. **AI Detection Flow**:
   - The AI Analytics Service processes video streams and detects events.
   - Upon detection, it sends an HTTP POST request to the Node.js backend API with event details.
   - The backend creates a new event record in the MongoDB database.

4. **Event List Flow**:
   - The React app requests the list of events from the Node.js backend API.
   - The backend retrieves event data from MongoDB and returns it to the frontend for display.

5. **Map View Flow**:
   - The React app requests camera locations and active events from the Node.js backend API.
   - The backend provides the necessary data, which the frontend uses to render the map with camera markers and event highlights.

## Conclusion

This C4 container diagram serves as a foundational blueprint for the Event Monitoring and Management Platform MVP. It emphasizes modularity and clear separation of concerns, facilitating future enhancements and scalability.