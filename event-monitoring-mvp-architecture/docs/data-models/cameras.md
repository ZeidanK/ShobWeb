# Camera Data Model

The camera data model defines the structure and properties of camera devices within the Event Monitoring and Management Platform. Cameras provide live video streams for AI analytics and event detection, with multi-tenant isolation and comprehensive configuration management.

## Camera Model Structure

```json
{
  "_id": "ObjectId",             // MongoDB ObjectId
  "companyId": "ObjectId",       // Reference to Company collection (multi-tenant isolation)
  "name": "string",              // Human-readable camera name
  "description": "string",       // Optional detailed description
  "serialNumber": "string",      // Manufacturer serial number (unique within company)
  "model": "string",             // Camera model/manufacturer
  "location": {
    "type": "Point",
    "coordinates": [number, number]  // [longitude, latitude] GeoJSON format
  },
  "address": "string",           // Human-readable installation address
  "streamUrl": "string",         // RTSP/HLS stream URL for video feed
  "snapshotUrl": "string",       // HTTP URL for snapshot images
  "status": "string",            // Current status: "online", "offline", "maintenance", "error"
  "config": {
    "resolution": "string",      // Video resolution (e.g., "1920x1080")
    "frameRate": "number",       // Frames per second
    "nightVision": "boolean",    // Night vision capability
    "ptz": "boolean",            // Pan-tilt-zoom capability
    "audio": "boolean"           // Audio recording capability
  },
  "aiConfig": {
    "enabled": "boolean",        // AI detection enabled
    "detectionTypes": ["string"], // Array of detection types to monitor
    "confidenceThreshold": "number", // Minimum confidence for alerts (0-1)
    "roi": [{                    // Regions of interest (polygons)
      "name": "string",
      "coordinates": [[number, number]]  // Array of [lng, lat] points
    }]
  },
  "vmsReference": "string",      // Reference ID in Video Management System
  "installationDate": "Date",    // Camera installation date
  "lastMaintenance": "Date",     // Last maintenance date
  "lastOnline": "Date",          // Last time camera was online
  "createdAt": "Date",           // Creation timestamp
  "updatedAt": "Date",           // Last update timestamp
  "tags": ["string"]             // Array of tags for categorization
}
```

## Properties Description

- **_id**: MongoDB ObjectId serving as the unique identifier for each camera.
- **companyId**: Reference to the Company collection, ensuring multi-tenant data isolation.
- **name**: Human-readable name for the camera (e.g., "Main Entrance North").
- **description**: Optional detailed description of the camera's purpose and coverage area.
- **serialNumber**: Manufacturer-provided serial number, unique within each company.
- **model**: Camera model and manufacturer information for support and compatibility.
- **location**: GeoJSON Point with longitude/latitude coordinates for mapping and location-based queries.
- **address**: Human-readable address where the camera is installed.
- **streamUrl**: URL for accessing the live video stream (RTSP, RTMP, HLS, etc.).
- **snapshotUrl**: HTTP URL for retrieving still images from the camera.
- **status**: Current operational status of the camera:
  - `"online"`: Camera is operational and streaming
  - `"offline"`: Camera is unreachable or powered off
  - `"maintenance"`: Camera is under maintenance
  - `"error"`: Camera has configuration or hardware issues
- **config**: Technical configuration settings for video streaming and capabilities.
- **aiConfig**: AI detection configuration including enabled detection types, confidence thresholds, and regions of interest.
- **vmsReference**: Reference identifier for integration with Video Management Systems.
- **installationDate**: Date when the camera was installed at its current location.
- **lastMaintenance**: Date of the most recent maintenance or inspection.
- **lastOnline**: Timestamp of the last successful communication with the camera.
- **createdAt** / **updatedAt**: Automatic timestamps for lifecycle tracking.
- **tags**: Array of strings for flexible categorization and filtering.

## AI Integration

Cameras integrate with the AI service for automated event detection:

- **Detection Types**: Configurable array of objects to detect (person, vehicle, animal, etc.)
- **Confidence Threshold**: Minimum AI confidence score required to generate alerts
- **Regions of Interest**: Polygonal areas within the camera view that require special attention
- **Real-time Processing**: Live video streams are processed by the AI service for immediate alerts

## Multi-Tenant Considerations

- All cameras are scoped to a specific company via `companyId`
- Serial numbers must be unique within each company but can repeat across companies
- Stream URLs and configurations are company-specific
- Location data enables company-specific geographic camera management

## Status Monitoring

Camera status is actively monitored:

- **Heartbeat Monitoring**: Regular pings to verify camera connectivity
- **Stream Validation**: Periodic checks of video stream availability
- **Alert Generation**: Automatic alerts for status changes
- **Maintenance Tracking**: Scheduled maintenance and issue tracking

## Security Considerations

- Stream URLs should use secure protocols (HTTPS, RTSP over TLS)
- Access to camera feeds is restricted by company and user permissions
- Configuration changes are logged for audit purposes
- Sensitive configuration data is encrypted at rest

## Future Considerations

As the platform evolves, additional properties may be added:

- **powerSource**: Battery, PoE, wired power source tracking
- **connectivity**: WiFi, Ethernet, cellular connectivity options
- **storage**: On-device or cloud storage configuration
- **analytics**: Historical analytics and performance metrics
- **integration**: Third-party VMS and security system integrations