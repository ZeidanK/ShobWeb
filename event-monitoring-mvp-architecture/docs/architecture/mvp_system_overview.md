# MVP System Overview

## Introduction

The Event Monitoring and Management Platform is designed to provide real-time monitoring and management of environmental, safety, and security events. This document outlines the architecture of the Minimum Viable Product (MVP), detailing the key components, their interactions, and the overall system structure to ensure easy expansion and modification in the future.

## Key Components

1. **Frontend (React Web Application)**
   - The user interface for security operators and control room users.
   - Modules include:
     - Authentication Module for user login.
     - Live Video View for streaming video from cameras.
     - Events List for displaying detected events.
     - Map View for visualizing camera locations and active events.
     - Event Details View for detailed information on specific events.

2. **Backend API (Node.js + Express)**
   - Serves as the intermediary between the frontend and the database.
   - Key services include:
     - Authentication Service for user validation and JWT issuance.
     - Camera Service for managing camera data and streams.
     - Event Service for handling event data and interactions.
     - Video Gateway for providing access to live video streams.
     - AI Integration Service for processing AI detection results.

3. **AI & Video Analytics Service**
   - A separate microservice responsible for running AI models on video streams.
   - Processes video frames to detect objects (e.g., people, vehicles) and sends detection events to the backend.

4. **Database (MongoDB)**
   - Stores user, camera, and event data.
   - Collections include:
     - Users: Information about system users and their roles.
     - Cameras: Details about camera configurations and locations.
     - Events: Records of detected events, including timestamps and statuses.

5. **External Systems**
   - **IP Cameras / VMS**: Provide live video streams for monitoring.
   - **Map Provider**: Supplies map tiles and geolocation services for the frontend.

## Data Flows

- **User Login Flow**: Users authenticate via the frontend, which communicates with the backend to validate credentials and retrieve a JWT token.
- **Live Video Flow**: The frontend requests video stream URLs from the backend, which in turn fetches the necessary information from the camera service.
- **AI Detection Flow**: The AI service processes video streams, detects events, and sends the results to the backend for storage and further action.
- **Event List Flow**: The frontend retrieves a list of events from the backend, displaying them to the user.
- **Map View Flow**: The frontend loads camera locations and active events from the backend and integrates with the map provider for visualization.

## Conclusion

This MVP architecture provides a solid foundation for the Event Monitoring and Management Platform, ensuring that the system is modular and scalable. Future enhancements can be easily integrated, such as additional AI models, advanced event management features, and expanded reporting capabilities. The architecture is designed to accommodate growth while maintaining performance and usability.