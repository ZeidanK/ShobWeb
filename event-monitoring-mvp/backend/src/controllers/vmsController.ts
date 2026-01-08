import { Request, Response } from 'express';
import { VmsServer } from '../models/VmsServer';

/**
 * VMS Controller
 *
 * What this controller does:
 * - Stores VMS server connection metadata in MongoDB.
 * - This is the foundation for later:
 *   - connecting cameras to a VMS (monitor/channel creation)
 *   - fetching live/playback URLs from the VMS
 *
 * What it does NOT do yet:
 * - It does not call Shinobi/ZoneMinder/etc. APIs yet.
 *   That will come later via a provider-specific client/adaptor layer.
 */

/**
 * POST /api/vms/servers
 * Registers a VMS server (Shinobi/ZoneMinder/AgentDVR/etc.)
 */
export const createVmsServer = async (req: Request, res: Response) => {
  const { name, provider, baseUrl, auth } = req.body;

  // Minimal validation (we can expand later / add middleware validation)
  if (!name || !provider || !baseUrl) {
    return res.status(400).json({
      success: false,
      message: 'name, provider and baseUrl are required',
    });
  }

  const server = await VmsServer.create({
    name,
    provider,
    baseUrl,
    auth,
    isActive: true,
  });

  return res.status(201).json({ success: true, data: server });
};

/**
 * GET /api/vms/servers
 * Lists all active VMS servers
 */
export const listVmsServers = async (_req: Request, res: Response) => {
  const servers = await VmsServer.find({ isActive: true }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: servers });
};
