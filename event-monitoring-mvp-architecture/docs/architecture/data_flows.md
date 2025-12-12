# Data Flows for Event Monitoring and Management Platform

This document outlines the data flows within the Event Monitoring and Management Platform MVP, illustrating how data moves between components and external systems. Understanding these flows is crucial for ensuring the architecture is structured for easy expansion and modification in the future.

## 1. User Login Flow

- **User** interacts with the **React App** to log in.
- The **React App** sends a request to the **Backend API** at `/auth/login` with user credentials.
- The **Backend API** validates the credentials against the **MongoDB** `users` collection.
- Upon successful validation, the **Backend API** issues a JWT token, which the **React App** stores for subsequent requests.

## 2. Live Video Flow

- **IP Cameras / VMS** provide live video streams.
- The **React App** requests video stream URLs from the **Backend API** at `/cameras/{id}/stream`.
- The **Backend API** retrieves the stream URL from the **MongoDB** `cameras` collection and returns it to the **React App**.
- The **React App** embeds the video player using the provided stream URL.

## 3. AI Detection Flow

- **IP Cameras / VMS** send video frames to the **AI Analytics Service** for processing.
- The **AI Analytics Service** runs the detection model (e.g., people/vehicle detection).
- For each detection, the **AI Analytics Service** constructs a detection payload containing:
  - `camera_id`
  - `timestamp`
  - `detection_type`
  - `coordinates` (optional)
  - `confidence score`
- The **AI Analytics Service** sends an HTTP POST request to the **Backend API** at `/internal/ai/events` with the detection payload.
- The **Backend API** validates the data and creates a new event document in the **MongoDB** `events` collection.

## 4. Event List Flow

- The **React App** requests the list of events from the **Backend API** at `/events`.
- The **Backend API** queries the **MongoDB** `events` collection and returns the event data.
- The **React App** displays the event list, including details such as time, camera, and event type.

## 5. Map View Flow

- The **React Map Module** requests camera positions from the **Backend API** at `/cameras`.
- The **Backend API** retrieves camera data from the **MongoDB** `cameras` collection and returns it.
- The **React Map Module** also requests active events from the **Backend API** at `/events?status=active`.
- The **Backend API** retrieves active events from the **MongoDB** `events` collection and returns them.
- The **Map Provider** delivers map tiles and background maps to the **React App**.
- The **React App** places markers on the map for camera locations and highlights cameras with active events.

## 6. Data Flow Summary

This document serves as a guide for understanding the interactions and data exchanges within the Event Monitoring and Management Platform MVP. By clearly defining these flows, we can ensure that the architecture remains adaptable for future enhancements and modifications.