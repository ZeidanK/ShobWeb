import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  VolumeUp as VolumeUpIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

const LiveView: React.FC = () => {
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null);
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  // Mock camera data
  const cameras = [
    {
      id: '1',
      name: 'Front Gate Camera',
      status: 'online',
      streamUrl: 'rtsp://192.168.1.100:554/stream',
      aiActive: true,
      detections: 3,
    },
    {
      id: '2',
      name: 'Parking Lot Camera',
      status: 'online',
      streamUrl: 'rtsp://192.168.1.101:554/stream',
      aiActive: true,
      detections: 1,
    },
    {
      id: '3',
      name: 'Side Entrance Camera',
      status: 'offline',
      streamUrl: 'rtsp://192.168.1.102:554/stream',
      aiActive: false,
      detections: 0,
    },
    {
      id: '4',
      name: 'Back Yard Camera',
      status: 'online',
      streamUrl: 'rtsp://192.168.1.103:554/stream',
      aiActive: true,
      detections: 0,
    },
  ];

  const VideoPlayer: React.FC<{
    camera: any;
    isFullscreen?: boolean;
  }> = ({ camera, isFullscreen = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={camera.name}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={camera.status}
              size="small"
              color={camera.status === 'online' ? 'success' : 'error'}
            />
            {camera.aiActive && (
              <Chip
                label={`${camera.detections} detections`}
                size="small"
                color="info"
              />
            )}
            <IconButton
              size="small"
              onClick={() => setFullscreenCamera(isFullscreen ? null : camera.id)}
            >
              <FullscreenIcon />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? '70vh' : '200px',
            backgroundColor: '#000',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {camera.status === 'online' ? (
            <Box sx={{ color: 'white', textAlign: 'center' }}>
              <PlayArrowIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">
                Live Stream
              </Typography>
              <Typography variant="caption" display="block">
                {camera.streamUrl}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ color: 'gray', textAlign: 'center' }}>
              <Typography variant="body2">
                Camera Offline
              </Typography>
            </Box>
          )}
          
          {/* Detection overlay (when AI is active) */}
          {camera.aiActive && camera.status === 'online' && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              AI ACTIVE
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <PlayArrowIcon />
            </IconButton>
            <IconButton size="small">
              <PauseIcon />
            </IconButton>
            <IconButton size="small">
              <VolumeUpIcon />
            </IconButton>
          </Box>
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Live Video Monitoring
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time surveillance from all connected cameras.
          </Typography>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={aiDetectionEnabled}
                onChange={(e) => setAiDetectionEnabled(e.target.checked)}
              />
            }
            label="AI Detection"
          />
        </Box>
      </Box>

      {/* Camera Grid */}
      <Grid container spacing={3}>
        {cameras.map((camera) => (
          <Grid item xs={12} sm={6} lg={6} key={camera.id}>
            <VideoPlayer camera={camera} />
          </Grid>
        ))}
      </Grid>

      {/* Fullscreen Dialog */}
      <Dialog
        open={Boolean(fullscreenCamera)}
        onClose={() => setFullscreenCamera(null)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: { maxWidth: '95vw', maxHeight: '95vh' }
        }}
      >
        <DialogTitle>
          Fullscreen View
          <IconButton
            onClick={() => setFullscreenCamera(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {fullscreenCamera && (
            <VideoPlayer
              camera={cameras.find(c => c.id === fullscreenCamera)}
              isFullscreen
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Controls Panel */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Live Stream Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<PlayArrowIcon />}>
            Start All
          </Button>
          <Button variant="outlined" startIcon={<PauseIcon />}>
            Pause All
          </Button>
          <Button variant="outlined" startIcon={<SettingsIcon />}>
            Stream Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LiveView;