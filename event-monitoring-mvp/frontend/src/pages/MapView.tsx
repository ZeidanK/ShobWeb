import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNsZjM4N3g3djBhdmczY3J1cGdpaHVpZjUifQ.demo-token';

/**
 * Camera interface defining the structure of camera objects
 */
interface Camera {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  location: {
    coordinates: [number, number];
    address: string;
  };
  activeEvents: number;
}

/**
 * EventMarker interface defining the structure of event markers on the map
 */
interface EventMarker {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number];
  timestamp: string;
  camera: string;
}

/**
 * MapView Component - Interactive map displaying security cameras and events
 * Features:
 * - Real-time camera locations and status
 * - Event markers with severity indicators
 * - Interactive popups and controls
 * - Layer toggling and map controls
 */
const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showCameras, setShowCameras] = useState(true);

  // Mock data for demonstration - replace with API calls
  const cameras: Camera[] = [
    {
      id: '1',
      name: 'Front Gate Camera',
      status: 'online',
      location: {
        coordinates: [-74.0060, 40.7128], // NYC coordinates
        address: '123 Main St, New York, NY',
      },
      activeEvents: 2,
    },
    {
      id: '2',
      name: 'Parking Lot Camera',
      status: 'online',
      location: {
        coordinates: [-74.0070, 40.7138],
        address: '125 Main St, New York, NY',
      },
      activeEvents: 0,
    },
    {
      id: '3',
      name: 'Side Entrance Camera',
      status: 'offline',
      location: {
        coordinates: [-74.0050, 40.7118],
        address: '121 Main St, New York, NY',
      },
      activeEvents: 0,
    },
  ];

  const events: EventMarker[] = [
    {
      id: '1',
      type: 'Person Detected',
      severity: 'medium',
      location: [-74.0060, 40.7128],
      timestamp: '2 min ago',
      camera: 'Front Gate Camera',
    },
    {
      id: '2',
      type: 'Unauthorized Access',
      severity: 'high',
      location: [-74.0055, 40.7125],
      timestamp: '5 min ago',
      camera: 'Front Gate Camera',
    },
  ];

  /**
   * Initialize Mapbox map on component mount
   */
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.0060, 40.7128], // NYC
      zoom: 15,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      addCameraMarkers();
      addEventMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  /**
   * Add camera markers to the map with status-based styling
   */
  const addCameraMarkers = () => {
    if (!map.current) return;

    cameras.forEach((camera) => {
      const el = document.createElement('div');
      el.className = 'camera-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      
      // Set marker color based on camera status
      if (camera.status === 'online') {
        el.style.backgroundColor = '#4caf50';
      } else if (camera.status === 'offline') {
        el.style.backgroundColor = '#f44336';
      } else {
        el.style.backgroundColor = '#ff9800';
      }

      el.innerHTML = `<svg width="20" height="20" fill="white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`;
      
      el.addEventListener('click', () => {
        setSelectedCamera(camera);
      });

      new mapboxgl.Marker(el)
        .setLngLat(camera.location.coordinates)
        .addTo(map.current!);

      // Add hover popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'camera-popup'
      }).setHTML(`
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px;">${camera.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            Status: <span style="color: ${camera.status === 'online' ? '#4caf50' : '#f44336'};">${camera.status}</span>
          </p>
          ${camera.activeEvents > 0 ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #f44336;">${camera.activeEvents} active events</p>` : ''}
        </div>
      `);

      el.addEventListener('mouseenter', () => {
        popup.setLngLat(camera.location.coordinates).addTo(map.current!);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  };

  /**
   * Add event markers to the map with severity-based styling
   */
  const addEventMarkers = () => {
    if (!map.current) return;

    events.forEach((event) => {
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.animation = 'pulse 2s infinite';
      
      const severityColors = {
        low: '#4caf50',
        medium: '#ff9800',
        high: '#f44336',
        critical: '#9c27b0',
      };
      
      el.style.backgroundColor = severityColors[event.severity];
      el.innerHTML = '<svg width="16" height="16" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';

      new mapboxgl.Marker(el)
        .setLngLat(event.location)
        .addTo(map.current!);

      // Add click popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px;">${event.type}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            Severity: <span style="color: ${severityColors[event.severity]};">${event.severity}</span>
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${event.timestamp}</p>
        </div>
      `);

      el.addEventListener('click', () => {
        popup.setLngLat(event.location).addTo(map.current!);
      });
    });
  };

  /**
   * Center the map on the default location
   */
  const centerOnLocation = () => {
    if (!map.current) return;
    map.current.flyTo({
      center: [-74.0060, 40.7128],
      zoom: 15,
      duration: 1000,
    });
  };

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = () => {
    if (!map.current) return;
    
    if (!document.fullscreenElement) {
      mapContainer.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
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
            Real-time view of cameras and security events.
          </Typography>
        </Box>
        
        {/* Layer Toggle Controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
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
          <FormControlLabel
            control={
              <Switch
                checked={showEvents}
                onChange={(e) => setShowEvents(e.target.checked)}
                color="error"
              />
            }
            label="Events"
          />
        </Box>
      </Box>

      {/* Map Container */}
      <Paper 
        sx={{ 
          height: 'calc(100vh - 200px)', 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        
        {/* Map Control Buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Tooltip title="Center Map">
            <IconButton
              onClick={centerOnLocation}
              sx={{
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle Layers">
            <IconButton
              onClick={() => setShowLayers(true)}
              sx={{
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <LayersIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fullscreen">
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Map Legend */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Legend
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  border: '2px solid white',
                }}
              />
              <Typography variant="caption">Online Camera</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#f44336',
                  border: '2px solid white',
                }}
              />
              <Typography variant="caption">Offline Camera</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ fontSize: 16, color: '#ff9800' }} />
              <Typography variant="caption">Active Event</Typography>
            </Box>
          </Box>
        </Paper>
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
              <Box sx={{ minWidth: 400, p: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Location:</strong> {selectedCamera.location.address}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> {selectedCamera.status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Active Events:</strong> {selectedCamera.activeEvents}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small">
                    View Live Stream
                  </Button>
                  <Button variant="outlined" size="small">
                    Camera Settings
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Map Layers Dialog */}
      <Dialog open={showLayers} onClose={() => setShowLayers(false)}>
        <DialogTitle>Map Layers</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 250, p: 1 }}>
            <FormControlLabel
              control={<Switch checked={showCameras} onChange={(e) => setShowCameras(e.target.checked)} />}
              label="Security Cameras"
            />
            <FormControlLabel
              control={<Switch checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />}
              label="Active Events"
            />
            <FormControlLabel
              control={<Switch checked={true} />}
              label="Detection Zones"
            />
            <FormControlLabel
              control={<Switch checked={false} />}
              label="Heat Map"
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Custom CSS Styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .camera-marker:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
        
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
        }
      `}</style>
    </Box>
  );
};

export default MapView;