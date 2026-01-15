import { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import { VmsServer } from '../models/VmsServer';
import { Camera } from '../models/Camera';

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

// Helper to fetch JSON from a VMS endpoint without extra dependencies.
const fetchJson = (url: URL, timeoutMs = 5000): Promise<any> =>
  new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, { method: 'GET', timeout: timeoutMs }, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse VMS response'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('VMS request timed out'));
    });
    req.on('error', (err) => reject(err));
    req.end();
  });

// Normalize Shinobi monitor payloads into a simple array.
const normalizeMonitors = (data: any[]): any[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (Array.isArray((data as any).monitors)) {
      return (data as any).monitors;
    }

    return Object.values(data);
  }

  return [];
};

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

/**
 * GET /api/vms/servers/:id/monitors
 * Lists monitors for a VMS server (Shinobi only for now)
 */
export const listVmsMonitors = async (req: Request, res: Response) => {
  const { id } = req.params;

  const server = await VmsServer.findById(id);
  if (!server || !server.isActive) {
    return res.status(404).json({ success: false, message: 'VMS server not found or inactive' });
  }

  if (server.provider !== 'shinobi') {
    return res.status(400).json({ success: false, message: 'Monitor discovery supports Shinobi only' });
  }

  const apiKey = server.auth?.apiKey;
  const groupKey = server.auth?.groupKey;
  if (!apiKey || !groupKey) {
    return res.status(400).json({ success: false, message: 'VMS server missing Shinobi auth keys' });
  }

  const baseUrl = String(server.baseUrl).replace(/\/+$/, '');
  const url = new URL(`${baseUrl}/${apiKey}/monitor/${groupKey}`);

  try {
    const data = await fetchJson(url);
    const monitors = normalizeMonitors(data);
    return res.status(200).json({ success: true, data: monitors });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch monitors' });
  }
};

/**
 * POST /api/vms/servers/:id/monitors/import
 * Batch-import monitors into cameras (maps to camera.vms)
 */
export const importVmsMonitors = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    monitorIds,
    defaultLocation,
    source,
  } = req.body as {
    monitorIds?: string[];
    defaultLocation?: { coordinates: [number, number]; address?: string };
    source?: string;
  };

  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const server = await VmsServer.findById(id);
  if (!server || !server.isActive) {
    return res.status(404).json({ success: false, message: 'VMS server not found or inactive' });
  }

  if (server.provider !== 'shinobi') {
    return res.status(400).json({ success: false, message: 'Monitor import supports Shinobi only' });
  }

  const apiKey = server.auth?.apiKey;
  const groupKey = server.auth?.groupKey;
  if (!apiKey || !groupKey) {
    return res.status(400).json({ success: false, message: 'VMS server missing Shinobi auth keys' });
  }

  const baseUrl = String(server.baseUrl).replace(/\/+$/, '');
  const url = new URL(`${baseUrl}/${apiKey}/monitor/${groupKey}`);

  let monitors: any[] = [];
  try {
    const data = await fetchJson(url);
    monitors = normalizeMonitors(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch monitors' });
  }

  const selected = monitorIds && monitorIds.length
    ? monitors.filter((m) => monitorIds.includes(String(m.mid || m.id)))
    : monitors;

  const existing = await Camera.find({
    isDeleted: false,
    'vms.serverId': server._id,
    'vms.monitorId': { $in: selected.map((m) => String(m.mid || m.id)) },
  }).select('vms.monitorId');

  const existingIds = new Set(existing.map((c) => String(c.vms?.monitorId)));

  const location = defaultLocation?.coordinates?.length === 2
    ? defaultLocation
    : { coordinates: [0, 0] as [number, number], address: 'Imported from VMS' };

  const hlsBase = `${baseUrl}/${apiKey}/hls/${groupKey}`;
  const payload = selected
    .filter((m) => !existingIds.has(String(m.mid || m.id)))
    .map((m) => {
      const monitorId = String(m.mid || m.id);
      const rawDescription = String(m.details || 'Imported from VMS');
      return {
        name: String(m.name || m.title || `Monitor ${monitorId}`),
        // TEST-ONLY: truncate to satisfy camera description length validation.
        description: rawDescription.slice(0, 500),
        streamUrl: `${hlsBase}/${monitorId}/s.m3u8`,
        type: 'ip',
        location: {
          type: 'Point',
          coordinates: location.coordinates,
          address: location.address,
        },
        settings: {
          resolution: '1920x1080',
          fps: 30,
          recordingEnabled: false,
        },
        metadata: {
          source: source || 'vms-import',
        },
        vms: {
          provider: server.provider,
          serverId: server._id,
          monitorId,
          lastSyncAt: new Date(),
        },
        createdBy: userId,
      };
    });

  if (!payload.length) {
    return res.status(200).json({ success: true, data: [], message: 'No new monitors to import' });
  }

  const created = await Camera.insertMany(payload);
  return res.status(201).json({ success: true, data: created });
};
