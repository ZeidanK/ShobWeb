# diagram_agent_prompt.md

Create a detailed system architecture diagram for the MVP "Event Monitoring and Management Platform" with live video, AI detection, map, and events. The tech stack is:

* Frontend: React (Web)
* Backend API: Node.js + Express
* Database: MongoDB
* AI Service: separate microservice (Python or similar) for video analytics
* External systems: IP Cameras or VMS, Map Provider (e.g., Mapbox/Google Maps)

The diagram should clearly show **components, data flows, and boundaries**.

### 1. High-Level Layout

Organize the diagram in layers:

* **Top layer**: Users & client (Web browser)
* **Middle layer**: Backend (Node/Express API) and AI Service
* **Bottom layer**: Database (MongoDB), Video Source (Cameras / VMS), Map Provider

Use grouping or boxes to show:

* “Client / Frontend”
* “Backend API”
* “AI & Video Analytics”
* “Data Storage”
* “External Services”

### 2. Actors / Users

Add a user actor:

* **Security Operator / Control Room User**

  * Interacts via the **Web Browser (React app)**
  * Can:

    * Log in
    * Watch live video
    * See events list
    * See map with cameras & events

### 3. Frontend (React Web App)

Show a **React Web Application** box with internal logical modules (they can be sub-boxes, compartments, or just labels):

1. **Auth Module**

   * Login form
   * Sends credentials to `/auth/login`
   * Receives JWT token

2. **Live Video View**

   * Requests video stream URLs from backend
   * Embeds video player (e.g., HLS/WebRTC/RTSP via gateway)
   * Shows one or a few cameras

3. **Events List / Events Panel**

   * Calls backend endpoint `/events` to fetch event list
   * Displays basic event details: time, camera, type

4. **Map View Module**

   * Loads map from Map Provider SDK (e.g., Mapbox/Google Maps)
   * Requests camera locations from backend (`/cameras`)
   * Requests active events from backend (`/events?status=active`)
   * Shows camera markers and highlights cameras with events

5. **Event Details View**

   * On click of event: fetch `/events/{id}` for details
   * Displays snapshot/image and metadata

The React app communicates **only** with the Backend API (Node/Express), not directly with AI or DB.

### 4. Backend API (Node.js + Express)

Draw a **Backend API (Node + Express)** container that exposes REST endpoints.

Inside it, show logical sub-components / services:

1. **Auth Controller / Service**

   * Endpoint: `POST /auth/login`
   * Validates user credentials against `Users` collection in MongoDB
   * Issues JWT tokens

2. **Camera Service**

   * Endpoint: `GET /cameras`
   * Returns a list of cameras with:

     * ID
     * Name
     * Location (GPS)
     * Stream URL or reference ID for VMS

3. **Event Service**

   * Endpoints:

     * `GET /events`
     * `GET /events/{id}`
   * Reads event records from MongoDB
   * Filters by:

     * time
     * camera
     * event type
     * status (active / resolved)

4. **Video Gateway / Stream Info Endpoint (MVP-simple)**

   * Endpoint: `GET /cameras/{id}/stream`
   * Returns a URL / token to access the live video stream (NOTE: actual streaming can be handled by a VMS or a media server, not implemented fully in MVP)

5. **AI Integration Service**

   * Receives detection results from AI Service via HTTP callback or message queue (for MVP, HTTP is enough)
   * When AI sends a detection event:

     * Validates data
     * Creates a new Event document in MongoDB
     * Optionally links to a snapshot image path

6. **Map / Geolocation Service (simple)**

   * Stores and serves static camera GPS coordinates
   * No advanced GIS logic in MVP

**Backend to Database Communication:**

* The Backend API connects to **MongoDB** and works with these collections:

  1. `users`

     * username
     * hashed_password
     * role (admin/operator)

  2. `cameras`

     * camera_id
     * name
     * location (lat, lon)
     * stream_url or VMS reference

  3. `events`

     * event_id
     * timestamp
     * camera_id
     * event_type (e.g., person_detected, vehicle_detected)
     * snapshot_url (optional)
     * status (e.g., new, acknowledged, closed)

### 5. AI & Video Analytics Service (Separate Microservice)

Draw a separate box labeled **AI Analytics Service**.

Responsibilities:

* Receives **video frames or video stream reference** from Video Ingestion layer or VMS
* Runs **ONE AI model in MVP** (e.g., object detection: people + vehicles)
* For each detection:

  * Builds a detection payload with:

    * camera_id
    * timestamp
    * detection_type (person/vehicle)
    * coordinates (optional)
    * confidence score
  * Sends HTTP POST to Backend API, e.g. `POST /internal/ai/events`

The AI Service is **not** directly visible to frontend.

Optionally, show:

* A **“Frame Extractor / Video Ingestion”** small component that:

  * Connects to the RTSP stream
  * Samples frames (e.g., 1–5 FPS)
  * Sends frames to the AI model

### 6. Database Layer (MongoDB)

Draw a **MongoDB** container with labeled collections:

* `users`
* `cameras`
* `events`

Show arrows:

* From Backend API to MongoDB (CRUD operations)
* AI Service never speaks directly to DB (only via Backend API)

### 7. External Systems

Add external systems as separate boxes:

1. **IP Cameras / VMS**

   * Output: Live video stream (RTSP / HLS / VMS proprietary)
   * Connected to:

     * Video Ingestion / AI Service (for analytics)
     * Video gateway / streaming server (if applicable)

2. **Map Provider**

   * Example: Mapbox / Google Maps
   * Provides:

     * Map tiles
     * Basemap
   * Used directly by the **React Frontend** via SDK or JS API

### 8. Data Flows (Label Arrows Clearly)

Please draw and label arrows for these main flows:

1. **User Login Flow**

   * User → React App → Backend `/auth/login` → MongoDB (validate user) → React stores JWT

2. **Live Video Flow (Simplified MVP)**

   * Camera → VMS/Stream Server → React Video Player (using URL fetched from Backend)
   * React requests `/cameras/{id}/stream` to get stream info

3. **AI Detection Flow**

   * Camera → Video Ingestion/AI Service → AI Model → Detection Event
   * AI Service → `POST /internal/ai/events` on Backend API
   * Backend API → MongoDB (`events` collection)

4. **Event List Flow**

   * React App → `GET /events` (Backend API) → MongoDB → React shows table/list

5. **Map View Flow**

   * React Map Module → `GET /cameras` (for camera positions)
   * React Map Module → `GET /events?status=active` (for active events)
   * Map Provider → delivers tiles/background map
   * React places markers and highlights cameras with events

### 9. Non-Functional Notes (Short Annotations)

Add text annotations or notes mentioning:

* MVP focus:

  * Small number of cameras (e.g., 1–5)
  * One AI model only
  * Simple RBAC (admin/operator)
  * No SMS/email alerts yet
  * No geofencing in MVP
* All communication between frontend and backend over HTTPS
* Backend–AI communication using internal HTTP calls (no heavy message bus in MVP)

### 10. Diagram Style

Use any style you like (C4 Container diagram, layered boxes, or classical system architecture), but:

* Make boundaries clear:

  * Frontend
  * Backend
  * AI Service
  * Database
  * External Systems
* Label all arrows with:

  * Protocol (HTTP/HTTPS, RTSP)
  * Main payload type (video stream, JSON, etc.)