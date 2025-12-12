import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Videocam as VideocamIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchCamerasData } from '../services/dataService';

// Camera interface matching backend model structure
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

const Cameras: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  // API call to fetch cameras from backend
  const fetchCameras = async () => {
    try {
      setLoading(true);
      
      const cameras = await fetchCamerasData();
      setCameras(cameras);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const handleEditCamera = (camera: any) => {
    setSelectedCamera(camera);
    setOpenDialog(true);
  };

  const handleAddCamera = () => {
    navigate('/cameras/add');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCamera(null);
  };

  const CameraCard: React.FC<{ camera: Camera }> = ({ camera }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideocamIcon color="primary" />
            <Typography variant="h6" component="h2">
              {camera.name}
            </Typography>
          </Box>
          <Chip 
            label={camera.status.toUpperCase()}
            color={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'error' : 'warning'}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {camera.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${camera.type.toUpperCase()} Camera`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={camera.settings.resolution}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${camera.settings.fps} FPS`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={camera.settings.recordingEnabled ? 'Recording' : 'Not Recording'}
            size="small"
            variant="outlined"
            color={camera.settings.recordingEnabled ? 'success' : 'default'}
          />
        </Box>
        
        <Typography variant="body2" gutterBottom>
          <strong>Resolution:</strong> {camera.settings.resolution}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>FPS:</strong> {camera.settings.fps}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          <strong>Location:</strong> {camera.location.address}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={camera.status === 'online' ? <StopIcon /> : <PlayArrowIcon />}
          color={camera.status === 'online' ? 'error' : 'success'}
        >
          {camera.status === 'online' ? 'Stop AI' : 'Start AI'}
        </Button>
        <IconButton size="small" onClick={() => handleEditCamera(camera)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" color="error">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Security Cameras
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your {cameras.length} security cameras
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box sx={{ pb: 10 }}> {/* Add bottom padding for FAB */}
          <Grid container spacing={3}>
            {cameras.map((camera) => (
              <Grid item xs={12} md={6} lg={4} key={camera._id}>
                <CameraCard camera={camera} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}      {/* Add Camera FAB */}
      <Fab
        color="primary"
        aria-label="add camera"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddCamera}
      >
        <AddIcon />
      </Fab>

      {/* Camera Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCamera ? 'Edit Camera' : 'Add New Camera'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Camera Name"
                defaultValue={selectedCamera?.name || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Camera Type"
                defaultValue={selectedCamera?.type || 'ip'}
              >
                <MenuItem value="ip">IP Camera</MenuItem>
                <MenuItem value="analog">Analog Camera</MenuItem>
                <MenuItem value="usb">USB Camera</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                defaultValue={selectedCamera?.description || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stream URL"
                defaultValue={selectedCamera?.streamUrl || ''}
                placeholder="rtsp://camera-ip:554/stream"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Address"
                defaultValue={selectedCamera?.location?.address || ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Resolution"
                defaultValue={selectedCamera?.settings?.resolution || '1920x1080'}
              >
                <MenuItem value="3840x2160">4K (3840x2160)</MenuItem>
                <MenuItem value="1920x1080">Full HD (1920x1080)</MenuItem>
                <MenuItem value="1280x720">HD (1280x720)</MenuItem>
                <MenuItem value="640x480">SD (640x480)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="FPS"
                defaultValue={selectedCamera?.settings?.fps || 30}
                inputProps={{ min: 1, max: 60 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Recording"
                defaultValue={selectedCamera?.settings?.recordingEnabled ? 'true' : 'false'}
              >
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedCamera ? 'Update' : 'Add'} Camera
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cameras;