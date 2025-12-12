# Camera Data Model

The camera data model defines the structure and properties of camera data within the Event Monitoring and Management Platform. This model is essential for managing the cameras that provide live video streams and for integrating with the AI analytics service.

## Camera Model Structure

- **camera_id**: 
  - Type: String
  - Description: Unique identifier for the camera.

- **name**: 
  - Type: String
  - Description: Human-readable name for the camera.

- **location**: 
  - Type: Object
  - Description: Geographic coordinates of the camera.
    - **latitude**: 
      - Type: Number
      - Description: Latitude of the camera's location.
    - **longitude**: 
      - Type: Number
      - Description: Longitude of the camera's location.

- **stream_url**: 
  - Type: String
  - Description: URL for accessing the live video stream (e.g., RTSP, HLS).

- **vms_reference**: 
  - Type: String (optional)
  - Description: Reference ID for the camera in the Video Management System (if applicable).

## Example Camera Object

```json
{
  "camera_id": "cam_001",
  "name": "Main Entrance",
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "stream_url": "rtsp://example.com/stream/cam_001",
  "vms_reference": "vms_cam_001"
}
```

This data model allows for easy expansion in the future, such as adding additional properties for camera settings, status, or integration with other systems.