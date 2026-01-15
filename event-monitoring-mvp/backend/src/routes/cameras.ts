import express from 'express';
import {
  getCameras,
  getCamera,
  createCamera,
  updateCamera,
  deleteCamera,
  deleteCamerasBySource,
  updateCameraStatus,
  startAIProcessing,
  stopAIProcessing,
  testCameraConnection,
} from '../controllers/cameraController';

import {
  connectCameraToVms,
  disconnectCameraFromVms,
  getCameraVmsStreams
} from '../controllers/cameraVmsController';

import { auth } from '../middleware/auth';
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
router.put('/:id', auth, validateCamera, updateCamera);


// TEST-ONLY: Bulk delete for demo/import sources (soft delete).
// @route   DELETE /api/cameras/source/:source
// @desc    Delete cameras by metadata.source
// @access  Private (dev branch: any authenticated user)
router.delete('/source/:source', auth, deleteCamerasBySource);

// @route   DELETE /api/cameras/:id
// @desc    Delete camera
// @access  Private (dev branch: any authenticated user)
router.delete('/:id', auth, deleteCamera);

// @route   PATCH /api/cameras/:id/status
// @desc    Update camera status
// @access  Private
router.patch('/:id/status', auth, updateCameraStatus);

/**
 * VMS Integration Routes
 *
 * What these routes do:
 * - Connect/Disconnect: store/clear a mapping between our Camera record and a VMS server/monitor.
 * - Streams: return stream information for the frontend (RTSP now; browser-playable URLs later).
 *
 * Why we need these:
 * - VMS is essential per Jira: the VMS manages live + recordings.
 * - Our app needs a stable API contract to attach cameras to a VMS and fetch playable URLs.
 */


// TEST-ONLY: dev branch allows any authenticated user to connect VMS for faster validation.
// @route   POST /api/cameras/:id/vms/connect
// @desc    Connect camera to a VMS server (save mapping to camera.vms)
// @access  Private (dev branch: any authenticated user)
router.post('/:id/vms/connect', auth, connectCameraToVms);


// TEST-ONLY: dev branch allows any authenticated user to disconnect VMS for faster validation.
// @route   POST /api/cameras/:id/vms/disconnect
// @desc    Disconnect camera from VMS (clear mapping from camera.vms)
// @access  Private (dev branch: any authenticated user)
router.post('/:id/vms/disconnect', auth, disconnectCameraFromVms);

// @route   GET /api/cameras/:id/vms/streams
// @desc    Get stream info for camera (RTSP + VMS mapping; later HLS/WebRTC URLs)
// @access  Private
router.get('/:id/vms/streams', auth, getCameraVmsStreams);


// @route   POST /api/cameras/:id/ai/start
// @desc    Start AI processing for camera
// @access  Private
router.post('/:id/ai/start', auth, startAIProcessing);

// @route   POST /api/cameras/:id/ai/stop
// @desc    Stop AI processing for camera
// @access  Private
router.post('/:id/ai/stop', auth, stopAIProcessing);

// @route   POST /api/cameras/test-connection
// @desc    Test stream URL connectivity (RTSP/HTTP)
// @access  Private
router.post('/test-connection', auth, testCameraConnection);



export default router;
