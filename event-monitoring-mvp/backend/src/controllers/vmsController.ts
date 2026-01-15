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

  // Normalize string inputs to avoid invisible whitespace breaking auth URLs.
  const normalizedBaseUrl = typeof baseUrl === 'string' ? baseUrl.trim() : baseUrl;
  const normalizedAuth = auth ? {
    apiKey: typeof auth.apiKey === 'string' ? auth.apiKey.trim() : auth.apiKey,
    groupKey: typeof auth.groupKey === 'string' ? auth.groupKey.trim() : auth.groupKey,
    username: typeof auth.username === 'string' ? auth.username.trim() : auth.username,
    password: typeof auth.password === 'string' ? auth.password.trim() : auth.password,
  } : auth;

  // Minimal validation (we can expand later / add middleware validation)
  if (!name || !provider || !normalizedBaseUrl) {
    return res.status(400).json({
      success: false,
      message: 'name, provider and baseUrl are required',
    });
  }

  // Provider-specific auth validation (Shinobi requires apiKey + groupKey)
  if (provider === 'shinobi') {
    if (!normalizedAuth?.apiKey || !normalizedAuth?.groupKey) {
      return res.status(400).json({
        success: false,
        message: 'Shinobi requires auth.apiKey and auth.groupKey',
      });
    }
  }

  const server = await VmsServer.create({
    name,
    provider,
    baseUrl: normalizedBaseUrl,
    auth: normalizedAuth,
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

/**
 * PATCH /api/vms/servers/:id
 * Updates VMS server details (including auth for providers like Shinobi)
 */
export const updateVmsServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, provider, baseUrl, auth, isActive } = req.body;

  // Normalize string inputs to avoid invisible whitespace breaking auth URLs.
  const normalizedBaseUrl = typeof baseUrl === 'string' ? baseUrl.trim() : baseUrl;
  const normalizedAuth = auth ? {
    apiKey: typeof auth.apiKey === 'string' ? auth.apiKey.trim() : auth.apiKey,
    groupKey: typeof auth.groupKey === 'string' ? auth.groupKey.trim() : auth.groupKey,
    username: typeof auth.username === 'string' ? auth.username.trim() : auth.username,
    password: typeof auth.password === 'string' ? auth.password.trim() : auth.password,
  } : auth;

  const server = await VmsServer.findById(id);

  if (!server) {
    return res.status(404).json({ success: false, message: 'VMS server not found' });
  }

  // Provider-specific auth validation (Shinobi requires apiKey + groupKey)
  const nextProvider = provider || server.provider;
  const nextAuth = normalizedAuth || server.auth;
  if (nextProvider === 'shinobi') {
    if (!nextAuth?.apiKey || !nextAuth?.groupKey) {
      return res.status(400).json({
        success: false,
        message: 'Shinobi requires auth.apiKey and auth.groupKey',
      });
    }
  }

  // Apply updates (only provided fields)
  if (name !== undefined) server.name = name;
  if (provider !== undefined) server.provider = provider;
  if (normalizedBaseUrl !== undefined) server.baseUrl = normalizedBaseUrl;
  if (normalizedAuth !== undefined) server.auth = normalizedAuth;
  if (isActive !== undefined) server.isActive = isActive;

  await server.save();

  return res.status(200).json({ success: true, data: server });
};

/**
 * DELETE /api/vms/servers/:id
 * Soft-removes a VMS server by marking it inactive (preserves history)
 */
export const deleteVmsServer = async (req: Request, res: Response) => {
  const { id } = req.params;

  const server = await VmsServer.findById(id);

  if (!server) {
    return res.status(404).json({ success: false, message: 'VMS server not found' });
  }

  // Keep record but disable it so it won't be used for streams.
  server.isActive = false;
  await server.save();

  return res.status(200).json({ success: true, data: server });
};
