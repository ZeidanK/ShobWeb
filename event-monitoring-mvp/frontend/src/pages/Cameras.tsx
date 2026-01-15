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
import {
  getCameras,
  deleteCamera,
  setCameraStatus,
  // VMS additions
  getVmsServers,
  createVmsServer,
  connectCameraToVms,
  disconnectCameraFromVms,
  getCameraVmsStreams,
  VmsServer,
  VmsProvider,
} from '../services/cameraService';




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
    // -----------------------------
  // VMS UI state
  // -----------------------------
  const [vmsServers, setVmsServers] = useState<VmsServer[]>([]);
  const [vmsLoading, setVmsLoading] = useState(false);

  // Create VMS server form fields
  const [newVmsName, setNewVmsName] = useState('Local VMS');
  const [newVmsProvider, setNewVmsProvider] = useState<VmsProvider>('shinobi');
  const [newVmsBaseUrl, setNewVmsBaseUrl] = useState('http://localhost:8080');

  // Shinobi auth (dev/testing)
  const [newVmsApiKey, setNewVmsApiKey] = useState('');
  const [newVmsGroupKey, setNewVmsGroupKey] = useState('');

  // Connect dialog state
  const [vmsConnectOpen, setVmsConnectOpen] = useState(false);
  const [vmsConnectCamera, setVmsConnectCamera] = useState<Camera | null>(null);
  const [selectedVmsServerId, setSelectedVmsServerId] = useState<string>('');
  const [monitorId, setMonitorId] = useState<string>('');

  // Streams dialog state (shows backend response for quick testing)
  const [streamsOpen, setStreamsOpen] = useState(false);
  const [streamsText, setStreamsText] = useState<string>('');

  
  const fetchCameras = async () => {
    try {
      setLoading(true);
      const cameraList = await getCameras();
      setCameras(cameraList);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };



  const fetchVmsServers = async () => {
    try {
      setVmsLoading(true);
      const list = await getVmsServers();
      setVmsServers(list);

      // Auto-select first server for convenience
      if (!selectedVmsServerId && list.length > 0) {
        setSelectedVmsServerId(list[0]._id);
      }
    } catch (error) {
      console.error('Error fetching VMS servers:', error);
    } finally {
      setVmsLoading(false);
    }
  };

  const handleCreateVmsServer = async () => {
    try {
        await createVmsServer({
        name: newVmsName,
        provider: newVmsProvider,
        baseUrl: newVmsBaseUrl,

        // Dev/testing: store Shinobi keys so backend can generate embed/hls URLs.
        // VmsServer model strips auth from responses, so it won't be returned to frontend.
        auth: {
          apiKey: newVmsApiKey || undefined,
          groupKey: newVmsGroupKey || undefined,
        },
      });

      // Refresh list so UI reflects the new server
      await fetchVmsServers();
    } catch (error) {
      console.error('Error creating VMS server:', error);
      alert((error as any)?.message || 'Failed to create VMS server');
    }
  };

  const openConnectDialog = (camera: Camera) => {
    setVmsConnectCamera(camera);
    setVmsConnectOpen(true);

    // default: pick first server if none selected
    if (!selectedVmsServerId && vmsServers.length > 0) {
      setSelectedVmsServerId(vmsServers[0]._id);
    }
  };

  const closeConnectDialog = () => {
    setVmsConnectOpen(false);
    setVmsConnectCamera(null);
    setMonitorId('');
  };

  const handleConnectToVms = async () => {
    if (!vmsConnectCamera) return;

    if (!selectedVmsServerId) {
      alert('Select a VMS server first');
      return;
    }

    try {
      await connectCameraToVms(vmsConnectCamera._id, {
        serverId: selectedVmsServerId,
        monitorId: monitorId || undefined,
      });

      await fetchCameras(); // refresh cards (camera.vms will now exist)
      closeConnectDialog();
    } catch (error) {
      console.error('Error connecting camera to VMS:', error);
      alert((error as any)?.message || 'Failed to connect camera to VMS');
    }
  };

  const handleDisconnectFromVms = async (camera: Camera) => {
    try {
      await disconnectCameraFromVms(camera._id);
      await fetchCameras();
    } catch (error) {
      console.error('Error disconnecting camera from VMS:', error);
      alert((error as any)?.message || 'Failed to disconnect camera from VMS');
    }
  };

  const handleShowStreams = async (camera: Camera) => {
    try {
      const data = await getCameraVmsStreams(camera._id);
      setStreamsText(JSON.stringify(data, null, 2));
      setStreamsOpen(true);
    } catch (error) {
      console.error('Error fetching streams:', error);
      alert((error as any)?.message || 'Failed to fetch streams');
    }
  };

  useEffect(() => {
    fetchCameras();
    fetchVmsServers();
  }, []);

  const handleToggleConnection = async (camera: Camera) => {
    try {
      // If it's online -> disconnect (set offline)
      // If it's offline/maintenance -> connect (set online)
      const newStatus = camera.status === 'online' ? 'offline' : 'online';
      await setCameraStatus(camera._id, newStatus);

      // simplest: refetch list so UI always matches DB
      await fetchCameras();
    } catch (error) {
      console.error('Error updating camera status:', error);
    }
  };

  const handleDeleteCamera = async (camera: Camera) => {
    // simple confirm for now (fast + effective)
    const ok = window.confirm(`Delete camera "${camera.name}"?`);
    if (!ok) return;

    try {
      await deleteCamera(camera._id);

      // update UI
      await fetchCameras();
    } catch (error) {
      console.error('Error deleting camera:', error);
    }
  };


  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'online': return 'success';
  //     case 'offline': return 'error';
  //     case 'maintenance': return 'warning';
  //     default: return 'default';
  //   }
  // };

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
          onClick={() => handleToggleConnection(camera)}
        >
          {camera.status === 'online' ? 'Disconnect' : 'Connect'}
        </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openConnectDialog(camera)}
                  disabled={vmsServers.length === 0}
                >
                  VMS Connect
                </Button>


        <Button
          size="small"
          variant="outlined"
          onClick={() => handleDisconnectFromVms(camera)}
        >
          VMS Disconnect
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => handleShowStreams(camera)}
        >
          Streams
        </Button>
        <IconButton size="small" onClick={() => handleEditCamera(camera)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDeleteCamera(camera)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto', p: 3, pb: 10 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Security Cameras
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your {cameras.length} security cameras
        </Typography>
      </Box>

            {/* VMS Servers Panel (for testing + integration setup) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            VMS Servers
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Name"
              size="small"
              value={newVmsName}
              onChange={(e) => setNewVmsName(e.target.value)}
            />

            <TextField
              select
              label="Provider"
              size="small"
              value={newVmsProvider}
              onChange={(e) => setNewVmsProvider(e.target.value as VmsProvider)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="shinobi">Shinobi</MenuItem>
              <MenuItem value="zoneminder">ZoneMinder</MenuItem>
              <MenuItem value="agentdvr">Agent DVR</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Base URL"
              size="small"
              value={newVmsBaseUrl}
              onChange={(e) => setNewVmsBaseUrl(e.target.value)}
              placeholder="http://localhost:8080"
              sx={{ minWidth: 260 }}
            />

                        <TextField
              label="API Key (Shinobi)"
              size="small"
              value={newVmsApiKey}
              onChange={(e) => setNewVmsApiKey(e.target.value)}
              sx={{ minWidth: 260 }}
            />

            <TextField
              label="Group Key (Shinobi)"
              size="small"
              value={newVmsGroupKey}
              onChange={(e) => setNewVmsGroupKey(e.target.value)}
              sx={{ minWidth: 260 }}
            />

            <Button variant="contained" onClick={handleCreateVmsServer} disabled={vmsLoading}>
              Add VMS Server
            </Button>

            <Button variant="outlined" onClick={fetchVmsServers} disabled={vmsLoading}>
              Refresh
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Servers:
              </Typography>
              <Chip
                label={vmsLoading ? 'Loading...' : `${vmsServers.length}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>


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
            {/* VMS Connect Dialog */}
      <Dialog open={vmsConnectOpen} onClose={closeConnectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Connect Camera to VMS</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Camera: <strong>{vmsConnectCamera?.name}</strong>
            </Typography>

            <TextField
              select
              label="VMS Server"
              value={selectedVmsServerId}
              onChange={(e) => setSelectedVmsServerId(e.target.value)}
              fullWidth
              size="small"
            >
              {vmsServers.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name} ({s.provider})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Monitor ID (optional)"
              value={monitorId}
              onChange={(e) => setMonitorId(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. demo-monitor-1"
              helperText="Optional for now. Later this will be created automatically by the VMS adapter."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConnectDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConnectToVms}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Streams Info Dialog (debug/testing) */}
      <Dialog open={streamsOpen} onClose={() => setStreamsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Camera Stream Info</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#111',
              color: '#eee',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.85rem',
            }}
          >
            {streamsText}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStreamsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Cameras;