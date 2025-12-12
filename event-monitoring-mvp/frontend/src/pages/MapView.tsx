import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom camera icons based on status
const createCameraIcon = (status: 'online' | 'offline' | 'maintenance') => {
  const colors = {
    online: '#4caf50',
    offline: '#f44336',
    maintenance: '#ff9800'
  };

  const svgIcon = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${colors[status]}" stroke="white" stroke-width="3"/>
      <path d="M12 14h8v6h-8z M20 17l4-2v6l-4-2z" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-camera-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

/**
 * Camera interface matching backend model structure
 */
interface Camera {
  _id: string;
  name: string;
  description?: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'maintenance';
  type: 'ip' | 'analog' | 'usb';
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  settings: {
    resolution: string;
    fps: number;
    recordingEnabled: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * MapView Component - Interactive map displaying security cameras
 * Uses Leaflet with OpenStreetMap (completely free, no API key required)
 */
const MapView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [showCameras, setShowCameras] = useState(true);
  const [cameras, setCameras] = useState<Camera[]>([]);

  // API call to fetch cameras - replace with actual API endpoint
  const fetchCameras = async () => {
    try {
      setLoading(true);
      
      // Mock data matching backend structure for now
      const mockCameras: Camera[] = [
        {
          _id: '1',
          name: 'Front Gate Camera',
          description: 'Main entrance monitoring',
          streamUrl: 'rtsp://192.168.1.100:554/stream',
          status: 'online',
          type: 'ip',
          location: {
            coordinates: [-74.0060, 40.7128], // NYC coordinates
            address: '123 Main St, New York, NY',
          },
          settings: {
            resolution: '1920x1080',
            fps: 30,
            recordingEnabled: true,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Parking Lot Camera',
          description: 'Vehicle monitoring area',
          streamUrl: 'rtsp://192.168.1.101:554/stream',
          status: 'online',
          type: 'ip',
          location: {
            coordinates: [-74.0070, 40.7138],
            address: '125 Main St, New York, NY',
          },
          settings: {
            resolution: '1920x1080',
            fps: 25,
            recordingEnabled: false,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'Side Entrance Camera',
          description: 'Secondary access point',
          streamUrl: 'rtsp://192.168.1.102:554/stream',
          status: 'offline',
          type: 'ip',
          location: {
            coordinates: [-74.0050, 40.7118],
            address: '121 Main St, New York, NY',
          },
          settings: {
            resolution: '1280x720',
            fps: 20,
            recordingEnabled: true,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setCameras(mockCameras);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize component - fetch cameras
   */
  useEffect(() => {
    fetchCameras();
  }, []);

  /**
   * Refresh camera data
   */
  const handleRefresh = () => {
    fetchCameras();
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Interactive Map
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time view of {cameras.length} cameras using OpenStreetMap.
          </Typography>
        </Box>
        
        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
          
          <FormControlLabel
            control={
              <Switch
                checked={showCameras}
                onChange={(e) => setShowCameras(e.target.checked)}
                color="primary"
              />
            }
            label="Cameras"
          />
        </Box>
      </Box>

      {/* Map Container */}
      <Paper 
        elevation={3}
        sx={{ 
          position: 'relative',
          height: 'calc(100vh - 200px)',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
        
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {showCameras && cameras.map((camera) => (
            <Marker
              key={camera._id}
              position={[camera.location.coordinates[1], camera.location.coordinates[0]]}
              icon={createCameraIcon(camera.status)}
              eventHandlers={{
                click: () => setSelectedCamera(camera)
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="h6" gutterBottom>
                    {camera.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={camera.status}
                      color={camera.status === 'online' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  {camera.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {camera.description}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" gutterBottom>
                    {camera.location.address || 'No address specified'}
                  </Typography>
                  <Typography variant="caption" display="block" gutterBottom>
                    Resolution: {camera.settings.resolution} • FPS: {camera.settings.fps}
                  </Typography>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => setSelectedCamera(camera)}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>

      {/* Camera Details Dialog */}
      <Dialog
        open={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
        maxWidth="md"
      >
        {selectedCamera && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VideocamIcon color="primary" />
                {selectedCamera.name}
                <Chip
                  label={selectedCamera.status}
                  color={selectedCamera.status === 'online' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ minWidth: 400 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Type:</strong> {selectedCamera.type.toUpperCase()} Camera
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Resolution:</strong> {selectedCamera.settings.resolution}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>FPS:</strong> {selectedCamera.settings.fps}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Recording:</strong> {selectedCamera.settings.recordingEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Location:</strong> {selectedCamera.location.address || 'No address'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Coordinates:</strong> {selectedCamera.location.coordinates[1].toFixed(6)}, {selectedCamera.location.coordinates[0].toFixed(6)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Stream URL:</strong>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    color: 'text.secondary',
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  {selectedCamera.streamUrl}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCamera(null)}>Close</Button>
              <Button variant="contained" color="primary">
                View Live Stream
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Custom CSS for camera markers */}
      <style>{`
        .custom-camera-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-camera-marker:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>
    </Box>
  );
};

export default MapView;