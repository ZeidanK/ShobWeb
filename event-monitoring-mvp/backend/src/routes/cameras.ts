import express from 'express';
import {
  getCameras,
  getCamera,
  createCamera,
  updateCamera,
  deleteCamera,
  updateCameraStatus,
  startAIProcessing,
  stopAIProcessing
} from '../controllers/cameraController';
import { auth, adminOnly } from '../middleware/auth';
import { validateCamera } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/cameras
// @desc    Get all cameras
// @access  Private
router.get('/', auth, getCameras);

// @route   GET /api/cameras/:id
// @desc    Get camera by ID
// @access  Private
router.get('/:id', auth, getCamera);

// @route   POST /api/cameras
// @desc    Create new camera
// @access  Private (Admin only)
router.post('/', auth, validateCamera, createCamera);

// @route   PUT /api/cameras/:id
// @desc    Update camera
// @access  Private (Admin only)
router.put('/:id', auth, adminOnly, validateCamera, updateCamera);

// @route   DELETE /api/cameras/:id
// @desc    Delete camera
// @access  Private (Admin only)
router.delete('/:id', auth, adminOnly, deleteCamera);

// @route   PATCH /api/cameras/:id/status
// @desc    Update camera status
// @access  Private
router.patch('/:id/status', auth, updateCameraStatus);

// @route   POST /api/cameras/:id/ai/start
// @desc    Start AI processing for camera
// @access  Private
router.post('/:id/ai/start', auth, startAIProcessing);

// @route   POST /api/cameras/:id/ai/stop
// @desc    Stop AI processing for camera
// @access  Private
router.post('/:id/ai/stop', auth, stopAIProcessing);

export default router;