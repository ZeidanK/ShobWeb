import { Request, Response } from 'express';
import { Camera } from '../models/Camera';


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