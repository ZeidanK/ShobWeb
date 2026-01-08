import express from 'express';
import { auth, adminOnly } from '../middleware/auth';
import { createVmsServer, listVmsServers } from '../controllers/vmsController';

/**
 * VMS Routes
 *
 * - Protected by JWT auth.
 * - Restricted to admins by default (admin/super_admin),
 *   since VMS server configuration is a system-level change.
 */
const router = express.Router();

// Register a VMS server
router.post('/servers', auth, adminOnly, createVmsServer);

// List VMS servers
router.get('/servers', auth, adminOnly, listVmsServers);

export default router;
