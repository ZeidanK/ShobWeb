import { Request, Response } from 'express';
import { Camera } from '../models/Camera';
import { VmsServer } from '../models/VmsServer';
import net from 'net';
import http from 'http';
import https from 'https';


type AuthReq = Request & { user?: { userId?: string } };

// @desc    Get all cameras
// @route   GET /api/cameras
// @access  Private
export const getCameras = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cameras = await Camera.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: cameras.length,
      data: cameras,
    });
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single camera
// @route   GET /api/cameras/:id
// @access  Private
export const getCamera = async (req: Request, res: Response): Promise<void> => {
  try {
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Get camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};



// @desc    Create camera
// @route   POST /api/cameras
// @access  Private (Admin/Manager)
export const createCamera = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      streamUrl,
      type,
      location,
      settings,
      metadata,
    } = req.body;

    // Check if camera with same name exists
    const existingCamera = await Camera.findOne({ name, isDeleted: false });
    if (existingCamera) {
      res.status(400).json({
        success: false,
        message: 'Camera with this name already exists',
      });
      return;
    }

    if (!req.user?.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }

    const normalizedLocation = {
      type: location?.type || 'Point',
      coordinates: location?.coordinates,
      address: location?.address,
    };


    const camera = await Camera.create({
      name,
      description,
      streamUrl,
      type: type || 'ip',
      location : normalizedLocation,
      settings: {
        resolution: settings?.resolution || '1920x1080',
        fps: settings?.fps || 30,
        recordingEnabled: settings?.recordingEnabled || false,
        ...settings,
      },
      metadata,
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Create camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update camera
// @route   PUT /api/cameras/:id
// @access  Private (Admin/Manager)
export const updateCamera = async (req: Request, res: Response): Promise<void> => {
  try {
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    // Update fields
    const updatedCamera = await Camera.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCamera,
    });
  } catch (error) {
    console.error('Update camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete camera
// @route   DELETE /api/cameras/:id
// @access  Private (Admin/Manager)
export const deleteCamera = async (req: Request, res: Response): Promise<void> => {
  try {
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    // Soft delete
    camera.isDeleted = true;
    camera.lastModified = new Date();
    await camera.save();

    res.json({
      success: true,
      message: 'Camera deleted successfully',
    });
  } catch (error) {
    console.error('Delete camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update camera status
// @route   PATCH /api/cameras/:id/status
// @access  Private
export const updateCameraStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    camera.status = status;
    camera.lastSeen = status === 'online' ? new Date() : camera.lastSeen;
    camera.lastModified = new Date();
    await camera.save();

    res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    console.error('Update camera status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Start AI processing for camera
// @route   POST /api/cameras/:id/ai/start
// @access  Private
export const startAIProcessing = async (req: Request, res: Response): Promise<void> => {
  try {
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    if (camera.status !== 'online') {
      res.status(400).json({
        success: false,
        message: 'Camera must be online to start AI processing',
      });
      return;
    }

    // TODO: Start AI processing via AI service
    // For now, just update the status
    camera.lastModified = new Date();
    await camera.save();

    res.json({
      success: true,
      message: 'AI processing started',
      data: camera,
    });
  } catch (error) {
    console.error('Start AI processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Stop AI processing for camera
// @route   POST /api/cameras/:id/ai/stop
// @access  Private
export const stopAIProcessing = async (req: Request, res: Response): Promise<void> => {
  try {
    const camera = await Camera.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!camera) {
      res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
      return;
    }

    // TODO: Stop AI processing via AI service
    // For now, just update the status
    camera.lastModified = new Date();
    await camera.save();

    res.json({
      success: true,
      message: 'AI processing stopped',
      data: camera,
    });
  } catch (error) {
    console.error('Stop AI processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Bulk delete cameras by metadata.source (soft delete)
// @route   DELETE /api/cameras/source/:source
// @access  Private (dev branch use)
export const deleteCamerasBySource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { source } = req.params;

    if (!source) {
      res.status(400).json({ success: false, message: 'source is required' });
      return;
    }

    const result = await Camera.updateMany(
      { isDeleted: false, 'metadata.source': source },
      { $set: { isDeleted: true, lastModified: new Date() } }
    );

    res.json({
      success: true,
      message: `Deleted ${result.modifiedCount} cameras`,
    });
  } catch (error) {
    console.error('Bulk delete cameras error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Test camera stream connectivity (RTSP/HTTP)
// @route   POST /api/cameras/test-connection
// @access  Private
export const testCameraConnection = async (req: Request, res: Response): Promise<void> => {
  const { streamUrl, mode, vmsServerId, monitorId } = req.body as {
    streamUrl?: string;
    mode?: 'rtsp' | 'vms';
    vmsServerId?: string;
    monitorId?: string;
  };

  if (!streamUrl) {
    res.status(400).json({ success: false, message: 'streamUrl is required' });
    return;
  }

  const timeoutMs = 4000;

  // Helper: TCP check for RTSP (port open)
  const testTcp = (host: string, port: number) =>
    new Promise<{ ok: boolean; message: string }>((resolve) => {
      const socket = new net.Socket();
      let done = false;

      const finish = (ok: boolean, message: string) => {
        if (done) return;
        done = true;
        socket.destroy();
        resolve({ ok, message });
      };

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => finish(true, 'TCP connection successful'));
      socket.once('timeout', () => finish(false, 'Connection timed out'));
      socket.once('error', (err) => finish(false, err.message));
      socket.connect(port, host);
    });

  // Helper: HTTP(S) reachability check (any response is "reachable")
  const testHttp = (targetUrl: URL, method: 'HEAD' | 'GET' = 'HEAD') =>
    new Promise<{ ok: boolean; message: string }>((resolve) => {
      const client = targetUrl.protocol === 'https:' ? https : http;
      const req = client.request(
        targetUrl,
        { method, timeout: timeoutMs },
        (resp) => {
          resp.resume();
          resolve({ ok: true, message: `HTTP reachable (${resp.statusCode})` });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, message: 'Connection timed out' });
      });
      req.on('error', (err) => resolve({ ok: false, message: err.message }));
      req.end();
    });

  const selectedMode = mode || 'rtsp';
  let result: { ok: boolean; message: string };

  if (selectedMode === 'vms') {
    if (!vmsServerId || !monitorId) {
      res.status(400).json({ success: false, message: 'vmsServerId and monitorId are required for VMS test' });
      return;
    }

    const vmsServer = await VmsServer.findById(vmsServerId);
    if (!vmsServer || !vmsServer.isActive) {
      res.status(404).json({ success: false, message: 'VMS server not found or inactive' });
      return;
    }

    if (vmsServer.provider !== 'shinobi') {
      res.status(400).json({ success: false, message: 'VMS test currently supports Shinobi only' });
      return;
    }

    const baseUrl = String(vmsServer.baseUrl).replace(/\/+$/, '');
    const apiKey = vmsServer.auth?.apiKey;
    const groupKey = vmsServer.auth?.groupKey;

    if (!apiKey || !groupKey) {
      res.status(400).json({ success: false, message: 'VMS server missing Shinobi auth keys' });
      return;
    }

    // TEST-ONLY: VMS reachability check uses Shinobi HLS/snapshot instead of direct RTSP.
    const hlsUrl = new URL(`${baseUrl}/${apiKey}/hls/${groupKey}/${monitorId}/s.m3u8`);
    const snapshotUrl = new URL(`${baseUrl}/${apiKey}/jpeg/${groupKey}/${monitorId}/s.jpg`);

    result = await testHttp(hlsUrl, 'GET');
    if (!result.ok) {
      result = await testHttp(snapshotUrl, 'GET');
    }
  } else {
    let url: URL;
    try {
      url = new URL(streamUrl);
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid streamUrl format' });
      return;
    }

    if (url.protocol === 'rtsp:') {
      const port = Number(url.port) || 554;
      result = await testTcp(url.hostname, port);
    } else if (url.protocol === 'http:' || url.protocol === 'https:') {
      result = await testHttp(url);
    } else {
      res.status(400).json({ success: false, message: 'Unsupported protocol' });
      return;
    }
  }

  res.status(200).json({
    success: true,
    ok: result.ok,
    message: result.message,
  });
};
