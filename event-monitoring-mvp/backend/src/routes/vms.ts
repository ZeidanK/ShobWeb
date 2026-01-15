import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listVmsServers, createVmsServer } from '../controllers/vmsController';

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

export default router;
