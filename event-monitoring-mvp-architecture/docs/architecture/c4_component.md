# C4 Component Diagram for Event Monitoring and Management Platform

## Overview

This document provides a detailed breakdown of the C4 component diagram for the Event Monitoring and Management Platform MVP. It outlines the internal components of each container and their interactions, ensuring a clear understanding of the system's architecture for future expansion and modification.

## Components

### 1. Frontend (React Web Application)

- **Auth Module**
  - Handles user authentication.
  - Interacts with the backend API to validate credentials and manage JWT tokens.

- **Live Video View**
  - Requests video stream URLs from the backend.
  - Displays live video feeds from connected cameras.

- **Events List / Events Panel**
  - Fetches and displays a list of events from the backend.
  - Allows users to view event details.

- **Map View Module**
  - Integrates with a map provider to display camera locations and active events.
  - Requests camera and event data from the backend.

- **Event Details View**
  - Displays detailed information about a selected event, including snapshots and metadata.

### 2. Backend API (Node.js + Express)

- **Auth Controller**
  - Manages user login and token issuance.
  - Validates user credentials against the database.

- **Camera Service**
  - Provides endpoints to retrieve camera information.
  - Returns camera details including stream URLs.

- **Event Service**
  - Manages event data, including creation, retrieval, and filtering of events.
  - Interacts with the database to store and retrieve event records.

- **Video Gateway**
  - Facilitates access to live video streams.
  - Provides endpoints to fetch stream URLs for frontend consumption.

- **AI Integration Service**
  - Receives detection results from the AI service.
  - Creates event records in the database based on AI detections.

### 3. AI & Video Analytics Service

- **AI Model**
  - Processes video streams to detect objects (e.g., people, vehicles).
  - Sends detection results to the backend API for event creation.

### 4. Database (MongoDB)

- **Users Collection**
  - Stores user data, including usernames, hashed passwords, and roles.

- **Cameras Collection**
  - Contains camera metadata, including IDs, names, locations, and stream URLs.

- **Events Collection**
  - Records event data, including timestamps, camera IDs, event types, and statuses.

### 5. External Systems

- **IP Cameras / VMS**
  - Provides live video streams to the system.
  - Interfaces with the AI service for video analytics.

- **Map Provider**
  - Supplies map tiles and geolocation services for the frontend application.

## Interactions

- **User Login Flow**
  - User interacts with the Auth Module → Sends credentials to the Auth Controller → Validates against Users Collection → Issues JWT token.

- **Live Video Flow**
  - Camera streams video → Video Gateway provides stream URL → Live Video View displays the stream.

- **AI Detection Flow**
  - Video stream processed by AI Model → Detection results sent to AI Integration Service → Event Service creates event in Events Collection.

- **Event List Flow**
  - Events Panel requests event data from Event Service → Displays events fetched from Events Collection.

- **Map View Flow**
  - Map View Module requests camera and event data → Displays camera locations and active events on the map.

## Conclusion

This C4 component diagram serves as a foundational reference for the development of the Event Monitoring and Management Platform MVP. It is designed to facilitate future enhancements and modifications, ensuring the architecture remains adaptable to evolving requirements.