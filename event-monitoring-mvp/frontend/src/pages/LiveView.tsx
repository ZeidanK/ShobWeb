import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  VolumeUp as VolumeUpIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

import { getCameras, getCameraVmsStreams } from '../services/cameraService';
import Hls from 'hls.js';

/**
 * Camera type used by LiveView.
 * Matches the backend camera model fields we rely on in the UI.
 */
interface Camera {
  _id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  streamUrl: string;
}

/**
 * Stream info contract from backend:
 * GET /api/cameras/:id/vms/streams
 *
 * For Shinobi (when camera is connected to a VMS server + monitor):
 * - liveEmbedUrl: browser-embeddable stream
 * - liveHlsUrl / snapshotUrl: useful later (playback/thumbnail)
 */
interface CameraStreams {
  cameraId: string;
  rtspUrl: string;
  vms: any | null;
  liveEmbedUrl: string | null;
  liveHlsUrl: string | null;
  snapshotUrl: string | null;
  playbackUrl: string | null;
}

const LiveView: React.FC = () => {
    const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null);
    const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true);

    // Real cameras from backend
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);

    // TEST-ONLY: Streams info dialog prints raw stream JSON for validation.
    const [streamsOpen, setStreamsOpen] = useState(false);
    const [streamsText, setStreamsText] = useState<string>('');

    /**
     * Live playback state (per camera)
     * - We only fetch stream URLs when the user clicks Play.
     * - We cache the response so repeated Play doesn't refetch.
     */
    const [streamsByCameraId, setStreamsByCameraId] = useState<Record<string, CameraStreams | null>>({});
    const [playingByCameraId, setPlayingByCameraId] = useState<Record<string, boolean>>({});
    const [streamLoadingCameraId, setStreamLoadingCameraId] = useState<string | null>(null);


  /**
   * Load cameras from backend (replaces mock data).
   */
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const list = await getCameras();
        setCameras(list);
      } catch (err) {
        console.error('Failed to load cameras:', err);
        alert((err as any)?.message || 'Failed to load cameras');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

    /**
   * Fetch VMS stream info for a camera and show it (debug/testing).
   */
    const handleShowStreams = async (camera: Camera) => {
      try {
        const data = await getCameraVmsStreams(camera._id);
        setStreamsText(JSON.stringify(data, null, 2));
        setStreamsOpen(true);
      } catch (err) {
        console.error('Failed to fetch streams:', err);
        alert((err as any)?.message || 'Failed to fetch streams');
      }
    };

    /**
     * Start live playback for a single camera.
     * - Fetch stream URLs once (cached).
     * - Then mark the camera as "playing" so the iframe is rendered.
     */
    const handlePlay = async (camera: Camera) => {
      try {
        // If we already have streams cached, just start playing.
        if (streamsByCameraId[camera._id]) {
          setPlayingByCameraId(prev => ({ ...prev, [camera._id]: true }));
          return;
        }

        setStreamLoadingCameraId(camera._id);

        const data = (await getCameraVmsStreams(camera._id)) as CameraStreams;
        setStreamsByCameraId(prev => ({ ...prev, [camera._id]: data }));
        setPlayingByCameraId(prev => ({ ...prev, [camera._id]: true }));
      } catch (err) {
        console.error('Failed to start stream:', err);
        alert((err as any)?.message || 'Failed to start stream');
      } finally {
        setStreamLoadingCameraId(null);
      }
    };

  /**
   * Stop live playback (removes iframe, keeps cached URLs).
   */
  const handlePause = (camera: Camera) => {
    setPlayingByCameraId(prev => ({ ...prev, [camera._id]: false }));
  };


  const VideoPlayer: React.FC<{
    camera: Camera;
    isFullscreen?: boolean;
  }> = ({ camera, isFullscreen = false }) => {
    const isPlaying = Boolean(playingByCameraId[camera._id]);
    const streams = streamsByCameraId[camera._id];
    const embedUrl = streams?.liveEmbedUrl || null;
    const liveHlsUrl = streams?.liveHlsUrl || null;
    const isLoading = streamLoadingCameraId === camera._id;
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
      if (!isPlaying || !liveHlsUrl || !videoRef.current) {
        return;
      }

      // Prefer HLS playback when available (more reliable than iframe).
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = liveHlsUrl;
        videoRef.current.play().catch(() => undefined);
        return;
      }

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(liveHlsUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(() => undefined);
        });

        return () => {
          hls.destroy();
        };
      }
    }, [isPlaying, liveHlsUrl]);

    const renderPlayer = () => {
      // While fetching stream URLs
      if (isLoading) {
        return (
          <Box sx={{ color: 'white', textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Loading stream...
            </Typography>
          </Box>
        );
      }

      // When playing and we have a browser-usable HLS URL
      if (isPlaying && liveHlsUrl) {
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <video
              ref={videoRef}
              controls
              playsInline
              style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
            />
          </Box>
        );
      }

      // Fallback to iframe embed if HLS is missing
      if (isPlaying && embedUrl) {
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <iframe
              title={`live-${camera._id}`}
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="autoplay; fullscreen"
            />
          </Box>
        );
      }

      // Default state: not playing yet (or no embed URL available)
      return (
        <Box sx={{ color: 'white', textAlign: 'center' }}>
          <PlayArrowIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2">
            {streams && !embedUrl && !liveHlsUrl
              ? 'No VMS stream available for this camera'
              : 'Click Play to load stream'}
          </Typography>
          <Typography variant="caption" display="block">
            {camera.streamUrl}
          </Typography>
        </Box>
      );
    };

    return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={camera.name}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={camera.status}
              size="small"
              color={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'error' : 'warning'}
            />

            {/* LiveView does not have per-camera AI state yet; show global toggle state only */}
            {aiDetectionEnabled && (
              <Chip label="AI ENABLED" size="small" color="info" />
            )}

            <IconButton
              size="small"
              onClick={() => setFullscreenCamera(isFullscreen ? null : camera._id)}
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
            renderPlayer()
          ) : (
            <Box sx={{ color: 'gray', textAlign: 'center' }}>
              <Typography variant="body2">Camera Offline</Typography>
            </Box>
          )}


          {/* Detection overlay (global toggle only, until AI is per-camera) */}
          {aiDetectionEnabled && camera.status === 'online' && (
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
              AI ENABLED
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handlePlay(camera)}
              disabled={camera.status !== 'online'}
            >
            <PlayArrowIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handlePause(camera)}
                disabled={camera.status !== 'online'}
              >
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

      {/* TEST-ONLY: Debug actions to inspect stream payloads. */}
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" onClick={() => handleShowStreams(camera)}>
          Streams Info
        </Button>
      </CardActions>
    </Card>
    );
  };


  return (
    <Box sx={{ height: 'calc(100vh - 112px)', overflow: 'auto' }}>
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cameras.map((camera) => (
            <Grid item xs={12} sm={6} lg={6} key={camera._id}>
              <VideoPlayer camera={camera} />
            </Grid>
          ))}
        </Grid>
      )}


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
              camera={cameras.find(c => c._id === fullscreenCamera)!}
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
            {/* TEST-ONLY: Streams Info Dialog shows raw JSON. */}
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
      </Dialog>
    </Box>
  );
};

export default LiveView;
