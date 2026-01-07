# AI Service - Event Monitoring MVP

Python-based AI/ML service providing real-time video analysis, object detection, and event generation using YOLOv8 and OpenCV.

## 🚀 Quick Start

### Prerequisites
- **Python** 3.9+ with pip
- **OpenCV** compatible system
- **CUDA** support (optional, for GPU acceleration)

### Development Setup

1. **Install Dependencies**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

2. **Download Models**
   ```bash
   # YOLOv8 model will download automatically on first run
   # Or manually download:
   mkdir -p models
   wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt -O models/yolov8n.pt
   ```

3. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Configure your settings
   nano .env
   ```

4. **Start AI Service**
   ```bash
   python app.py
   ```

5. **Verify Setup**
   - API available at: http://localhost:8000
   - Health check: http://localhost:8000/health
   - API docs: http://localhost:8000/docsbash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows
```

### 2. Install Dependencies
```bash
# Install Python packages
pip install -r requirements.txt
```

### 3. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Start AI Service
```bash
python app.py
```

The AI service will be available at: http://localhost:8000

## Environment Configuration

Edit the `.env` file with these settings:

```bash
# Python Configuration
PYTHONUNBUFFERED=1

# API Configuration
API_URL=http://localhost:5000/api
API_TIMEOUT=30

# Model Configuration
MODEL_PATH=./models
DEFAULT_MODEL=yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
DEVICE=cpu  # or 'cuda' for GPU

# Video Processing
FRAME_SKIP=5
MAX_CONCURRENT_STREAMS=3
PROCESSING_INTERVAL=2

# Detection Configuration
ENABLE_PERSON_DETECTION=true
ENABLE_VEHICLE_DETECTION=true
ENABLE_MOTION_DETECTION=false

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/ai-service.log

# Performance
BATCH_SIZE=1
MAX_DETECTIONS_PER_FRAME=100
```

## System Dependencies

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y \
    python3-dev \
    python3-pip \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgtk-3-0 \
    ffmpeg \
    libopencv-dev
```

### macOS
```bash
# Install with Homebrew
brew install python@3.9 opencv ffmpeg
```

### Windows
```bash
# Install Visual C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Install with pip (may require additional system libs)
pip install opencv-python
```

## GPU Support (Optional)

For faster processing with NVIDIA GPU:

### Install CUDA
```bash
# Check GPU compatibility
nvidia-smi

# Install CUDA toolkit (example for Ubuntu)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/7fa2af80.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/ /"
sudo apt update
sudo apt install cuda
```

### Install PyTorch with CUDA
```bash
# Replace cpu-only pytorch
pip uninstall torch torchvision
pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cu118
```

### Update Environment
```bash
# In .env file
DEVICE=cuda
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T...",
  "model_loaded": true,
  "device": "cpu",
  "active_streams": 0
}
```

### Start Detection
```bash
POST /start-detection
Content-Type: application/json

{
  "camera_id": "camera-123",
  "stream_url": "rtsp://camera-ip:554/stream",
  "location": {
    "coordinates": [-74.0060, 40.7128]
  }
}
```

### Stop Detection
```bash
POST /stop-detection/{camera_id}
```

### Get Active Streams
```bash
GET /active-streams
```

## Supported Detection Types

### Object Classes
The AI service detects these object types:

**People Detection:**
- Class ID: 0 (person)
- Event Type: `person_detected`

**Vehicle Detection:**
- Class ID: 2 (car)
- Class ID: 3 (motorcycle) 
- Class ID: 5 (bus)
- Class ID: 6 (train)
- Class ID: 7 (truck)
- Event Type: `vehicle_detected`

### Confidence Levels
- **High**: > 90% confidence → High severity
- **Medium**: 70-90% confidence → Medium severity  
- **Low**: 50-70% confidence → Low severity

## Stream Processing

### Video Sources
The AI service supports:
- RTSP streams (`rtsp://`)
- HTTP streams (`http://`)
- HTTPS streams (`https://`)
- USB cameras (`/dev/video0`)
- Video files (`.mp4`, `.avi`, etc.)

### Performance Optimization
```bash
# Adjust frame processing in .env
FRAME_SKIP=5              # Process every 5th frame
PROCESSING_INTERVAL=2     # Process every 2 seconds
MAX_CONCURRENT_STREAMS=3  # Limit simultaneous streams
```

## Model Management

### Default Model
The service downloads YOLOv8 nano model automatically on first run:
- **File**: `yolov8n.pt` (6MB)
- **Speed**: ~45 FPS on CPU
- **Accuracy**: Good for most use cases

### Custom Models
To use different YOLO models:

```bash
# Download larger models for better accuracy
# yolov8s.pt (22MB) - Small model
# yolov8m.pt (52MB) - Medium model  
# yolov8l.pt (88MB) - Large model
# yolov8x.pt (137MB) - Extra large model

# Place in models/ directory
mkdir -p models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8s.pt -O models/yolov8s.pt

# Update .env
DEFAULT_MODEL=yolov8s.pt
```

## Troubleshooting

### Common Issues

**1. OpenCV installation fails:**
```bash
# Install system dependencies first
sudo apt install libopencv-dev python3-opencv

# Reinstall opencv-python
pip uninstall opencv-python
pip install opencv-python-headless
```

**2. CUDA out of memory:**
```bash
# Switch back to CPU
# In .env: DEVICE=cpu

# Or reduce batch size
BATCH_SIZE=1
```

**3. Model download fails:**
```bash
# Manual download
cd models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt

# Check internet connection and firewall
curl -I https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

**4. Stream connection issues:**
```bash
# Test stream URL manually
ffplay rtsp://camera-ip:554/stream

# Check camera accessibility
ping camera-ip
telnet camera-ip 554
```

**5. High CPU usage:**
```bash
# Increase frame skip
FRAME_SKIP=10

# Increase processing interval  
PROCESSING_INTERVAL=5

# Limit concurrent streams
MAX_CONCURRENT_STREAMS=1
```

### Debugging

**Enable debug logging:**
```bash
# In .env
LOG_LEVEL=DEBUG
```

**Check logs:**
```bash
tail -f logs/ai-service.log
```

**Test detection manually:**
```bash
# Upload test image
curl -X POST http://localhost:8000/detect \
  -F "file=@test_image.jpg" \
  -F "detection_types=person,vehicle"
```

## Development

### Code Structure
```
ai-service/
├── app.py              # Main FastAPI application
├── src/
│   ├── models/         # AI model wrappers
│   ├── services/       # Detection and processing logic
│   └── utils/          # Helper functions
├── models/             # Model files (auto-downloaded)
├── logs/               # Log files
├── requirements.txt    # Python dependencies
└── .env.example       # Environment template
```

### Adding New Detection Types
```python
# In app.py, modify class mappings
self.animal_classes = [15, 16, 17]  # bird, cat, dog
# Add new event type logic
elif class_id in self.animal_classes:
    event_type = 'animal_detected'
```

### Custom Post-processing
```python
# Add filters in process_frame method
if confidence >= self.confidence_threshold:
    # Size filter - ignore small detections
    box_area = (x2 - x1) * (y2 - y1)
    if box_area < 1000:  # Skip small boxes
        continue
        
    # Location filter - only detect in specific regions
    center_x = (x1 + x2) / 2
    if center_x < frame.shape[1] * 0.2:  # Skip left 20%
        continue
```

## Integration

### With Backend API
The AI service automatically sends detected events to:
```
POST http://localhost:5000/api/events
```

### With Frontend
Start detection from frontend camera management:
```javascript
// Start AI detection for camera
fetch('http://localhost:8000/start-detection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    camera_id: 'cam-123',
    stream_url: 'rtsp://192.168.1.100:554/stream',
    location: { coordinates: [-74.0060, 40.7128] }
  })
});
```

## Production Deployment

### Systemd Service
```bash
# Create service file
sudo nano /etc/systemd/system/ai-service.service

[Unit]
Description=Event Monitoring AI Service
After=network.target

[Service]
Type=simple
User=ai-user
WorkingDirectory=/opt/event-monitoring/ai-service
Environment=PATH=/opt/event-monitoring/ai-service/venv/bin
ExecStart=/opt/event-monitoring/ai-service/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable ai-service
sudo systemctl start ai-service
```

### Docker Deployment
```bash
# Build image
docker build -t event-monitoring-ai .

# Run container
docker run -d \
  --name ai-service \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/logs:/app/logs \
  event-monitoring-ai
```