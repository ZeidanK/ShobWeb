import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listVmsServers, createVmsServer, updateVmsServer, deleteVmsServer } from '../controllers/vmsController';

const router = Router();

router.use(auth);

/**
 * DEV NOTE:
 * These routes were admin-only, but for the camera-connection dev branch we allow any authenticated user
 * so we can test Shinobi/VMS integration without fighting role setup.
 * Revert to adminOnly before merging to main.
 */
router.get('/servers', listVmsServers);
router.post('/servers', createVmsServer);
// Update VMS server details (including auth keys when needed).
router.patch('/servers/:id', updateVmsServer);
// Soft-delete a VMS server (mark inactive) so it stops appearing in active lists.
router.delete('/servers/:id', deleteVmsServer);

export default router;
