import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Camera } from '../models/Camera';
import { VmsServer } from '../models/VmsServer';

/**
 * Camera ↔ VMS Controller
 *
 * What this controller does:
 * - "Connect" a camera record to a specific VMS server by saving a mapping:
 *   camera.vms.serverId + camera.vms.provider + camera.vms.monitorId
 * - "Disconnect" clears that mapping
 * - "Streams" returns information that the frontend can use:
 *   - always includes the stored RTSP URL (camera.streamUrl)
 *   - can later return browser-playable URLs coming from the VMS (HLS/WebRTC)
 *
 * What it does NOT do yet:
 * - It does not actually call the VMS provider API to create a monitor/channel.
 *   For now, it stores the mapping and provides a stable contract for the frontend.
 *   Provider API calls come later via adapter clients (Shinobi/ZoneMinder/etc.).
 */

/**
 * POST /api/cameras/:id/vms/connect
 * Body: { serverId: string, monitorId?: string }
 *
 * Saves a mapping between our camera and a VMS server.
 * monitorId is optional for now because:
 * - Some flows may create monitorId later (after we implement provider API calls).
 */
export const connectCameraToVms = async (req: Request, res: Response) => {
  const cameraId = req.params.id;
  const { serverId, monitorId } = req.body as { serverId?: string; monitorId?: string };
  const normalizedMonitorId = typeof monitorId === 'string' ? monitorId.trim() : monitorId;

  if (!serverId) {
    return res.status(400).json({ success: false, message: 'serverId is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(cameraId)) {
    return res.status(400).json({ success: false, message: 'Invalid camera id' });
  }

  if (!mongoose.Types.ObjectId.isValid(serverId)) {
    return res.status(400).json({ success: false, message: 'Invalid serverId' });
  }

  const [camera, vmsServer] = await Promise.all([
    Camera.findById(cameraId),
    VmsServer.findById(serverId),
  ]);

  if (!camera) {
    return res.status(404).json({ success: false, message: 'Camera not found' });
  }

  if (!vmsServer || !vmsServer.isActive) {
    return res.status(404).json({ success: false, message: 'VMS server not found or inactive' });
  }

  // Store mapping (provider comes from the VMS server record)
  camera.vms = {
    provider: vmsServer.provider,
    serverId: vmsServer._id,
    monitorId: normalizedMonitorId || camera.vms?.monitorId, // keep existing if already set
    lastSyncAt: new Date(),
  };

  await camera.save();

  return res.status(200).json({
    success: true,
    message: 'Camera connected to VMS (mapping saved)',
    data: camera,
  });
};

/**
 * POST /api/cameras/:id/vms/disconnect
 *
 * Clears the VMS mapping on the camera record.
 */
export const disconnectCameraFromVms = async (req: Request, res: Response) => {
  const cameraId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(cameraId)) {
    return res.status(400).json({ success: false, message: 'Invalid camera id' });
  }

  const camera = await Camera.findById(cameraId);

  if (!camera) {
    return res.status(404).json({ success: false, message: 'Camera not found' });
  }

  camera.vms = {
    provider: 'other',   // reset provider to default-ish
    serverId: undefined,
    monitorId: undefined,
    lastSyncAt: new Date(),
  };

  await camera.save();

  return res.status(200).json({
    success: true,
    message: 'Camera disconnected from VMS (mapping cleared)',
    data: camera,
  });
};

/**
 * GET /api/cameras/:id/vms/streams
 *
 * Returns stream info for the camera.
 * For now:
 * - Always returns the stored RTSP URL
 * - Returns VMS mapping info
 *
 * Later:
 * - We will query the VMS provider and return browser-playable URLs:
 *   { liveHlsUrl, liveWebrtcUrl, playbackUrl, ... }
 */
export const getCameraVmsStreams = async (req: Request, res: Response) => {
  const cameraId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(cameraId)) {
    return res.status(400).json({ success: false, message: 'Invalid camera id' });
  }

  const camera = await Camera.findById(cameraId);

  if (!camera) {
    return res.status(404).json({ success: false, message: 'Camera not found' });
  }

  /**
   * Streams contract
   * - Always returns the stored RTSP URL and the current VMS mapping (if any)
   * - If the camera is connected to a supported VMS provider (Shinobi for now),
   *   returns browser-usable URLs computed from the stored VMS credentials + monitor id.
   *
   * Security note:
   * - We NEVER return VMS credentials (apiKey/groupKey) directly.
   * - Only derived stream URLs are returned to the frontend.
   */
  const baseResponse = {
    cameraId: camera._id,
    rtspUrl: camera.streamUrl,
    vms: camera.vms || null,

    // Browser-usable URLs (provider-dependent)
    liveEmbedUrl: null as string | null,
    liveHlsUrl: null as string | null,
    snapshotUrl: null as string | null,

    // Placeholders for next iteration
    playbackUrl: null as string | null,
  };

  // If not connected to any VMS server/monitor, return the base contract.
  const serverId = camera.vms?.serverId;
  const monitorId = camera.vms?.monitorId;
  const provider = camera.vms?.provider;

  if (!serverId || !monitorId || !provider || provider === 'other') {
    return res.status(200).json({ success: true, data: baseResponse });
  }

  const vmsServer = await VmsServer.findById(serverId);

  if (!vmsServer || !vmsServer.isActive) {
    return res.status(404).json({ success: false, message: 'VMS server not found or inactive' });
  }

  // Provider-specific URL generation
  if (vmsServer.provider === 'shinobi') {
    const baseUrl = String(vmsServer.baseUrl).replace(/\/+$/, '');
    const apiKey = vmsServer.auth?.apiKey;
    const groupKey = vmsServer.auth?.groupKey;

    /**
     * Shinobi URL format
     * - embed:   {baseUrl}/{API_KEY}/embed/{GROUP_KEY}/{MONITOR_ID}
     * - hls:     {baseUrl}/{API_KEY}/hls/{GROUP_KEY}/{MONITOR_ID}/s.m3u8
     * - snapshot:{baseUrl}/{API_KEY}/jpeg/{GROUP_KEY}/{MONITOR_ID}/s.jpg
     */
    if (apiKey && groupKey) {
      baseResponse.liveEmbedUrl = `${baseUrl}/${apiKey}/embed/${groupKey}/${monitorId}`;
      baseResponse.liveHlsUrl = `${baseUrl}/${apiKey}/hls/${groupKey}/${monitorId}/s.m3u8`;
      baseResponse.snapshotUrl = `${baseUrl}/${apiKey}/jpeg/${groupKey}/${monitorId}/s.jpg`;
    }

    return res.status(200).json({ success: true, data: baseResponse });
  }

  // Other providers not implemented yet: keep the base contract.
  return res.status(200).json({ success: true, data: baseResponse });
};

