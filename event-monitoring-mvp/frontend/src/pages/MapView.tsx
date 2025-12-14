import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Chip,
  Badge,
  CircularProgress,
  Alert,
  Collapse,
  Tooltip,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Divider,
  CardActions,
  Avatar,
} from '@mui/material';
import {
  Layers as LayersIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Videocam as VideocamIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '../types/index';
import { fetchCamerasData, fetchEventsData, SecurityEvent } from '../services/dataService';
import MapContextMenu from '../components/MapContextMenu';
import { useNavigate } from 'react-router-dom';

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

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showCameras, setShowCameras] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  
  // Context menu states
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    latLng: { lat: number; lng: number };
  } | null>(null);
  
  // UI states
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  const [selectedCameraDetails, setSelectedCameraDetails] = useState<Camera | null>(null);

  // Fetch cameras and events from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cameras, events] = await Promise.all([
        fetchCamerasData(),
        fetchEventsData(),
      ]);
      
      setCameras(cameras);
      setEvents(events);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filteredCams = cameras.filter(camera => {
      const matchesSearch = searchTerm === '' || 
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.location.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    let filteredEvts = events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.cameraName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter;
      const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
      const matchesResolved = !showUnresolvedOnly || !event.resolved;
      
      return matchesSearch && matchesType && matchesSeverity && matchesResolved;
    });

    setFilteredCameras(filteredCams);
    setFilteredEvents(filteredEvts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cameras, events, searchTerm, statusFilter, eventTypeFilter, severityFilter, showUnresolvedOnly]);

  // Create event markers with severity-based styling
  const createEventIcon = (severity: string) => {
    const colors = {
      low: '#2196f3',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f'
    };

    const svgIcon = `
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${colors[severity as keyof typeof colors]}" stroke="white" stroke-width="2"/>
        <path d="M10 8h10v6h-10z M15 14l5-3v8l-5-3z" fill="white"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-event-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Context menu handlers
  const handleMapRightClick = (e: any) => {
    const { lat, lng } = e.latlng;
    const { x, y } = e.containerPoint;
    
    setContextMenu({
      position: { x: x + e.target._container.offsetLeft, y: y + e.target._container.offsetTop },
      latLng: { lat, lng }
    });
  };

  const handleAddCamera = (position: { lat: number; lng: number }) => {
    navigate('/cameras/add', { 
      state: { 
        coordinates: { 
          latitude: position.lat, 
          longitude: position.lng 
        } 
      } 
    });
  };

  const handleCreateEvent = (position: { lat: number; lng: number }) => {
    // TODO: Implement event creation modal
    console.log('Creating event at:', position);
  };

  const handleViewCoverage = (position: { lat: number; lng: number }) => {
    // TODO: Show camera coverage areas
    console.log('Viewing coverage for:', position);
  };

  const handleAnalyzeArea = (position: { lat: number; lng: number }) => {
    // TODO: Open area analysis tools
    console.log('Analyzing area:', position);
  };

  const handleSetWaypoint = (position: { lat: number; lng: number }) => {
    // TODO: Add waypoint functionality
    console.log('Setting waypoint:', position);
  };

  const handleMeasureDistance = (position: { lat: number; lng: number }) => {
    // TODO: Start distance measurement
    console.log('Measuring distance from:', position);
  };

  const handleViewTimeline = (position: { lat: number; lng: number }) => {
    // TODO: Show timeline for location
    console.log('Viewing timeline for:', position);
  };

  // Map event handler component
  const MapEventHandler = () => {
    const map = useMapEvents({
      contextmenu: (e) => {
        const { lat, lng } = e.latlng;
        const { x, y } = e.containerPoint;
        
        setContextMenu({
          position: { x, y },
          latLng: { lat, lng }
        });
      },
    });
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Header with Search and Filters */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', zIndex: 1000, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h1">
            Security Map
          </Typography>
          <TextField
            size="small"
            placeholder="Search cameras and events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={() => setShowLayers(!showLayers)}>
            <LayersIcon />
          </IconButton>
          <IconButton onClick={() => setShowSidebar(!showSidebar)}>
            <InfoIcon />
          </IconButton>
        </Box>

        {/* Layer Controls */}
        <Collapse in={showLayers}>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Switch checked={showCameras} onChange={(e) => setShowCameras(e.target.checked)} />}
              label={`Cameras (${filteredCameras.length})`}
            />
            <FormControlLabel
              control={<Switch checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />}
              label={`Events (${filteredEvents.length})`}
            />
            <FormControlLabel
              control={<Switch checked={showOverview} onChange={(e) => setShowOverview(e.target.checked)} />}
              label="Overview Panel"
            />
          </Box>
        </Collapse>
      </Box>

      {/* Side Drawer for Camera Details */}
      <Drawer
        anchor="right"
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        variant="persistent"
        sx={{
          width: showSidebar ? 400 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            top: '120px',
            height: 'calc(100vh - 120px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Camera Details</Typography>
            <IconButton onClick={() => setShowSidebar(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedCameraDetails ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: selectedCameraDetails.status === 'online' ? 'success.main' : selectedCameraDetails.status === 'offline' ? 'error.main' : 'warning.main' }}>
                    <VideocamIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedCameraDetails.name}</Typography>
                    <Chip 
                      label={selectedCameraDetails.status} 
                      size="small" 
                      color={selectedCameraDetails.status === 'online' ? 'success' : selectedCameraDetails.status === 'offline' ? 'error' : 'warning'}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedCameraDetails.description}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>Location</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedCameraDetails.location.address}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>Settings</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Resolution: {selectedCameraDetails.settings.resolution}</Typography>
                  <Typography variant="body2">FPS: {selectedCameraDetails.settings.fps}</Typography>
                  <Typography variant="body2">Recording: {selectedCameraDetails.settings.recordingEnabled ? 'Enabled' : 'Disabled'}</Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button 
                  variant="contained" 
                  startIcon={<PlayArrowIcon />}
                  disabled={selectedCameraDetails.status !== 'online'}
                  size="small"
                >
                  Live Feed
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  size="small"
                >
                  Settings
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click on a camera marker to view details
            </Typography>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>All Cameras</Typography>
          <List>
            {filteredCameras.map((camera) => (
              <ListItem key={camera._id} disablePadding>
                <ListItemButton 
                  onClick={() => {
                    setSelectedCameraDetails(camera);
                    setSelectedCamera(camera);
                  }}
                  selected={selectedCameraDetails?._id === camera._id}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar sx={{ 
                      bgcolor: camera.status === 'online' ? 'success.main' : camera.status === 'offline' ? 'error.main' : 'warning.main',
                      width: 32,
                      height: 32
                    }}>
                      <VideocamIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {camera.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {camera.location.address}
                      </Typography>
                    </Box>
                    <Chip 
                      label={camera.status} 
                      size="small"
                      variant="outlined"
                      color={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'error' : 'warning'}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Camera Status</InputLabel>
            <Select
              value={statusFilter}
              label="Camera Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={eventTypeFilter}
              label="Event Type"
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="motion">Motion</MenuItem>
              <MenuItem value="person_detected">Person Detected</MenuItem>
              <MenuItem value="intrusion">Intrusion</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch 
                checked={showUnresolvedOnly} 
                onChange={(e) => setShowUnresolvedOnly(e.target.checked)} 
              />
            }
            label="Unresolved Events Only"
          />
        </Box>
      </Menu>

      {/* Map */}
      <Box 
        sx={{ height: 'calc(100vh - 120px)', position: 'relative' }}
        onClick={() => setContextMenu(null)}
      >
        <MapContainer
          center={[40.7831, -73.9712]}
          zoom={13}
          style={{ height: '100%', width: showSidebar ? 'calc(100% - 400px)' : '100%' }}
        >
          <MapEventHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Camera Markers */}
          {showCameras && filteredCameras.map((camera) => (
            <Marker
              key={`camera-${camera._id}-${camera.location.coordinates[1]}-${camera.location.coordinates[0]}`}
              position={[camera.location.coordinates[1], camera.location.coordinates[0]]}
              icon={createCameraIcon(camera.status)}
              eventHandlers={{
                click: () => {
                  setSelectedCameraDetails(camera);
                  setSelectedCamera(camera);
                  setShowSidebar(true);
                },
              }}
            >
              <Popup>
                <Box>
                  <Typography variant="h6">{camera.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {camera.description}
                  </Typography>
                  <Chip
                    label={camera.status}
                    size="small"
                    color={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'error' : 'warning'}
                    sx={{ mt: 1, mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<PlayArrowIcon />}
                      disabled={camera.status !== 'online'}
                      onClick={() => {
                        setSelectedCameraDetails(camera);
                        setShowSidebar(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          ))}

          {/* Event Markers - CRITICAL FIX: Using stable coordinate-based keys */}
          {showEvents && filteredEvents.map((event) => (
            <Marker
              key={`event-${event._id}-${event.location.coordinates[1]}-${event.location.coordinates[0]}`}
              position={[event.location.coordinates[1], event.location.coordinates[0]]}
              icon={createEventIcon(event.severity)}
            >
              <Popup>
                <Box>
                  <Typography variant="h6">{event.type.replace('_', ' ')}</Typography>
                  <Typography variant="body2">{event.description}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip
                      label={event.severity}
                      size="small"
                      color={event.severity === 'critical' ? 'error' : event.severity === 'high' ? 'warning' : 'default'}
                    />
                    {!event.resolved && (
                      <Chip
                        label="Unresolved"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Camera: {event.cameraName}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {new Date(event.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Bottom Left Overview Panel */}
        <Collapse in={showOverview}>
          <Card 
            sx={{ 
              position: 'absolute', 
              bottom: 24, 
              left: 16, 
              minWidth: 300,
              maxWidth: 400,
              maxHeight: 'calc(100vh - 200px)',
              zIndex: 1000,
              bgcolor: 'background.paper',
              boxShadow: 3,
              overflow: 'auto'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  System Overview
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setShowOverview(false)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {filteredCameras.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cameras
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {filteredEvents.filter(e => !e.resolved).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Events
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Online Cameras:</Typography>
                <Chip 
                  label={`${filteredCameras.filter(c => c.status === 'online').length}/${filteredCameras.length}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Critical Events:</Typography>
                <Chip 
                  label={filteredEvents.filter(e => e.severity === 'critical' && !e.resolved).length}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">High Priority:</Typography>
                <Chip 
                  label={filteredEvents.filter(e => e.severity === 'high' && !e.resolved).length}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button 
                size="small"
                onClick={() => setShowSidebar(true)}
                startIcon={<InfoIcon />}
              >
                Camera Details
              </Button>
              <Button 
                size="small" 
                onClick={() => setShowLayers(!showLayers)}
                startIcon={<LayersIcon />}
              >
                Layers
              </Button>
            </CardActions>
          </Card>
        </Collapse>
      </Box>

      {/* Right-click Context Menu */}
      <MapContextMenu
        position={contextMenu?.position || null}
        latLng={contextMenu?.latLng || null}
        onClose={() => setContextMenu(null)}
        onAddCamera={handleAddCamera}
        onCreateEvent={handleCreateEvent}
        onViewCoverage={handleViewCoverage}
        onAnalyzeArea={handleAnalyzeArea}
        onSetWaypoint={handleSetWaypoint}
        onMeasureDistance={handleMeasureDistance}
        onViewTimeline={handleViewTimeline}
        userRole="operator"
        nearbyData={{
          cameras: filteredCameras.length,
          events: filteredEvents.length,
          detections: 0
        }}
      />
    </Box>
  );
};

export default MapView;