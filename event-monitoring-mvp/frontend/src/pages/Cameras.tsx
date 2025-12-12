import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Videocam as VideocamIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

const Cameras: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);

  // Mock data - replace with real API calls
  const mockCameras = [
    {
      id: '1',
      name: 'Front Gate Camera',
      description: 'Main entrance monitoring',
      streamUrl: 'rtsp://192.168.1.100:554/stream',
      status: 'online',
      type: 'ip',
      location: {
        coordinates: [-74.0060, 40.7128],
        address: '123 Main St, New York, NY',
      },
      settings: {
        resolution: '1920x1080',
        fps: 30,
        recordingEnabled: true,
      },
    },
    {
      id: '2',
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
    },
    {
      id: '3',
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
    },
  ];

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
    setSelectedCamera(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCamera(null);
  };

  const CameraCard: React.FC<{ camera: any }> = ({ camera }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VideocamIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            {camera.name}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {camera.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={camera.status}
            size="small"
            color={getStatusColor(camera.status) as any}
          />
          <Chip
            label={camera.type.toUpperCase()}
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" gutterBottom>
          <strong>Resolution:</strong> {camera.settings.resolution}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>FPS:</strong> {camera.settings.fps}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Recording:</strong> {camera.settings.recordingEnabled ? 'Enabled' : 'Disabled'}
        </Typography>
        <Typography variant="body2">
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
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Camera Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Configure and monitor your security cameras.
      </Typography>

      {/* Cameras Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {mockCameras.map((camera) => (
          <Grid item xs={12} md={6} lg={4} key={camera.id}>
            <CameraCard camera={camera} />
          </Grid>
        ))}
      </Grid>

      {/* Add Camera FAB */}
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