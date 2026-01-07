import asyncio
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
import cv2
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
from ultralytics import YOLO

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('LOG_FILE', './logs/ai-service.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Pydantic models
class DetectionRequest(BaseModel):
    camera_id: str
    stream_url: str
    location: Dict[str, List[float]]

class DetectionResult(BaseModel):
    camera_id: str
    event_type: str
    confidence: float
    bounding_box: Optional[Dict[str, float]]
    object_count: int
    timestamp: str
    location: Dict[str, List[float]]

class AIService:
    def __init__(self):
        self.model_path = os.getenv('MODEL_PATH', './models')
        self.confidence_threshold = float(os.getenv('CONFIDENCE_THRESHOLD', '0.5'))
        self.device = os.getenv('DEVICE', 'cpu')
        self.api_url = os.getenv('API_URL', 'http://localhost:5000/api')
        
        # Load YOLO model
        self.model = None
        self.load_model()
        
        # Class mappings for COCO dataset
        self.person_classes = [0]  # person
        self.vehicle_classes = [2, 3, 5, 6, 7]  # car, motorcycle, bus, train, truck
        
        # Active processing streams
        self.active_streams: Dict[str, bool] = {}

    def load_model(self):
        """Load the YOLO model"""
        try:
            model_file = os.path.join(self.model_path, os.getenv('DEFAULT_MODEL', 'yolov8n.pt'))
            if not os.path.exists(model_file):
                logger.info(f"Model file not found at {model_file}, downloading...")
                os.makedirs(self.model_path, exist_ok=True)
                
            self.model = YOLO('yolov8n.pt')  # This will auto-download if needed
            self.model.to(self.device)
            logger.info(f"Model loaded successfully on device: {self.device}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    async def process_frame(self, frame: np.ndarray, camera_id: str, location: Dict) -> List[DetectionResult]:
        """Process a single frame for detections"""
        try:
            # Run inference
            results = self.model(frame, conf=self.confidence_threshold, verbose=False)
            detections = []
            
            for result in results:
                if result.boxes is not None:
                    boxes = result.boxes
                    
                    # Process each detection
                    for i in range(len(boxes)):
                        class_id = int(boxes.cls[i])
                        confidence = float(boxes.conf[i])
                        
                        # Determine event type
                        event_type = None
                        if class_id in self.person_classes:
                            event_type = 'person_detected'
                        elif class_id in self.vehicle_classes:
                            event_type = 'vehicle_detected'
                        
                        if event_type and confidence >= self.confidence_threshold:
                            # Get bounding box
                            box = boxes.xyxy[i].cpu().numpy()
                            x1, y1, x2, y2 = box
                            
                            detection = DetectionResult(
                                camera_id=camera_id,
                                event_type=event_type,
                                confidence=confidence,
                                bounding_box={
                                    'x': float(x1),
                                    'y': float(y1),
                                    'width': float(x2 - x1),
                                    'height': float(y2 - y1)
                                },
                                object_count=1,
                                timestamp=datetime.utcnow().isoformat(),
                                location=location
                            )
                            detections.append(detection)
            
            return detections
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return []

    async def send_detection_to_backend(self, detection: DetectionResult):
        """Send detection result to backend API"""
        try:
            event_data = {
                'title': f'{detection.event_type.replace("_", " ").title()} Detected',
                'description': f'AI detected {detection.event_type.replace("_", " ")} with {detection.confidence:.2%} confidence',
                'type': detection.event_type,
                'severity': self.determine_severity(detection),
                'cameraId': detection.camera_id,
                'location': detection.location,
                'detectionData': {
                    'confidence': detection.confidence,
                    'boundingBox': detection.bounding_box,
                    'objectCount': detection.object_count,
                    'aiModel': 'YOLOv8'
                }
            }
            
            response = requests.post(
                f"{self.api_url}/events",
                json=event_data,
                timeout=int(os.getenv('API_TIMEOUT', '30'))
            )
            
            if response.status_code == 201:
                logger.info(f"Successfully sent detection for camera {detection.camera_id}")
            else:
                logger.error(f"Failed to send detection: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error sending detection to backend: {e}")

    def determine_severity(self, detection: DetectionResult) -> str:
        """Determine event severity based on detection"""
        if detection.confidence > 0.9:
            return 'high'
        elif detection.confidence > 0.7:
            return 'medium'
        else:
            return 'low'

    async def process_video_stream(self, camera_id: str, stream_url: str, location: Dict):
        """Process video stream from camera"""
        logger.info(f"Starting video processing for camera {camera_id}")
        self.active_streams[camera_id] = True
        
        frame_skip = int(os.getenv('FRAME_SKIP', '5'))
        processing_interval = int(os.getenv('PROCESSING_INTERVAL', '2'))
        
        cap = None
        frame_count = 0
        
        try:
            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                logger.error(f"Failed to open stream: {stream_url}")
                return
            
            last_processing_time = 0
            
            while self.active_streams.get(camera_id, False):
                ret, frame = cap.read()
                if not ret:
                    logger.warning(f"Failed to read frame from camera {camera_id}")
                    await asyncio.sleep(1)
                    continue
                
                frame_count += 1
                current_time = datetime.now().timestamp()
                
                # Skip frames for performance
                if frame_count % frame_skip != 0:
                    continue
                
                # Process at intervals
                if current_time - last_processing_time < processing_interval:
                    continue
                
                last_processing_time = current_time
                
                # Process frame
                detections = await self.process_frame(frame, camera_id, location)
                
                # Send detections to backend
                for detection in detections:
                    await self.send_detection_to_backend(detection)
                
                await asyncio.sleep(0.1)  # Small delay to prevent overwhelming
                
        except Exception as e:
            logger.error(f"Error in video stream processing: {e}")
        finally:
            if cap:
                cap.release()
            self.active_streams[camera_id] = False
            logger.info(f"Stopped processing camera {camera_id}")

# Initialize FastAPI app
app = FastAPI(title="Event Monitoring AI Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AIService()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": ai_service.model is not None,
        "device": ai_service.device,
        "active_streams": len(ai_service.active_streams)
    }

@app.post("/start-detection")
async def start_detection(request: DetectionRequest, background_tasks: BackgroundTasks):
    """Start detection for a camera stream"""
    if request.camera_id in ai_service.active_streams:
        raise HTTPException(status_code=400, detail="Detection already active for this camera")
    
    background_tasks.add_task(
        ai_service.process_video_stream,
        request.camera_id,
        request.stream_url,
        request.location
    )
    
    return {"message": f"Detection started for camera {request.camera_id}"}

@app.post("/stop-detection/{camera_id}")
async def stop_detection(camera_id: str):
    """Stop detection for a camera"""
    if camera_id not in ai_service.active_streams:
        raise HTTPException(status_code=404, detail="No active detection for this camera")
    
    ai_service.active_streams[camera_id] = False
    return {"message": f"Detection stopped for camera {camera_id}"}

@app.get("/active-streams")
async def get_active_streams():
    """Get list of active detection streams"""
    return {
        "active_streams": list(ai_service.active_streams.keys()),
        "count": len(ai_service.active_streams)
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting AI Service on {host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")