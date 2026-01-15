# Changes Overview (Camera/VMS Work)

This document summarizes the major changes made to support camera/VMS integration,
live view playback, and demo/production flows.

## Major Features Added

1) VMS server registry with auth (Shinobi)
- Create, update, list, and delete VMS servers.
- Stores Shinobi `apiKey` and `groupKey` so backend can generate stream URLs.

2) Camera ↔ VMS mapping + stream URLs
- Connect/disconnect camera to a VMS server (stores `camera.vms` mapping).
- Stream endpoint returns `liveEmbedUrl`, `liveHlsUrl`, and `snapshotUrl` for Shinobi.

3) Live View playback (HLS + iframe fallback)
- Live view prefers HLS playback using `hls.js` and a `<video>` element.
- Falls back to Shinobi embed iframe if HLS is unavailable.

4) Camera connection testing (RTSP and VMS)
- Backend test endpoint supports:
  - Direct RTSP/HTTP reachability (TCP/HTTP).
  - VMS-based test for Shinobi (HLS/snapshot reachability).

5) Demo vs production split
- Cameras page now separates Shinobi Demo/Test flow vs Production flow.
- Demo flow supports monitor discovery and batch import from Shinobi.
- Demo cameras are tagged with `metadata.source = "shinobi-demo"` to allow bulk cleanup.

6) Monitor payload hardening (Shinobi)
- Normalizes monitor discovery responses so UI doesn't crash on non-array payloads.
- Adds a refresh option for VMS server lists in Add Camera test mode.

7) Backend CORS allowlist for local dev
- Accepts common localhost/127.0.0.1 origins to prevent CORS network errors in the UI.

8) Dev CORS relax + import description truncation
- Non-production now allows all origins to prevent dev CORS blocks.
- Shinobi monitor import truncates long descriptions to avoid validation errors.

## Key Endpoints (Backend)

VMS servers:
- `GET /api/vms/servers`
- `POST /api/vms/servers`
- `PATCH /api/vms/servers/:id`
- `DELETE /api/vms/servers/:id`
- `GET /api/vms/servers/:id/monitors` (Shinobi)
- `POST /api/vms/servers/:id/monitors/import` (Shinobi batch import)

Cameras:
- `POST /api/cameras/:id/vms/connect`
- `POST /api/cameras/:id/vms/disconnect`
- `GET /api/cameras/:id/vms/streams`
- `POST /api/cameras/test-connection`
- `DELETE /api/cameras/source/:source` (demo cleanup)

## Important Code Blocks

HLS playback (Live View):
- File: `frontend/src/pages/LiveView.tsx`
- Logic: use `hls.js` when `liveHlsUrl` is available, otherwise fallback to iframe.

VMS monitor discovery + import:
- File: `backend/src/controllers/vmsController.ts`
- Shinobi API: `GET {baseUrl}/{apiKey}/monitor/{groupKey}`
- Import maps monitors into cameras with `camera.vms` and `metadata.source`.

RTSP/VMS connectivity test:
- File: `backend/src/controllers/cameraController.ts`
- `mode: "rtsp"` uses TCP/HTTP check.
- `mode: "vms"` uses Shinobi HLS/snapshot check.

## Frontend Components Updated

- `frontend/src/pages/Cameras.tsx`
  - Split Demo/Test and Production actions.
  - Added monitor discovery, batch import, and demo cleanup.
  - VMS server edit/delete actions.

- `frontend/src/pages/AddCamera.tsx`
  - Uses backend reachability test.
  - Prevents auto-submit outside final step.
  - Optional VMS test mode (Shinobi).

- `frontend/src/pages/LiveView.tsx`
  - HLS playback with `hls.js`.

## Test-Only Markers (Camera-Related Files)

These indicate demo-only UI or dev-branch access:
- `backend/src/routes/vms.ts`
- `backend/src/routes/cameras.ts`
- `backend/src/models/Camera.ts`
- `frontend/src/pages/Cameras.tsx`
- `frontend/src/pages/LiveView.tsx`
- `frontend/src/pages/AddCamera.tsx`

## Notes and Caveats

- Shinobi HLS playback is used for in-browser viewing (RTSP is not directly playable).
- Batch import uses a default location if none is provided; update later if needed.
- Demo cameras are tagged with `metadata.source` for easy bulk deletion.

## Next Phases (If Needed)

Phase 8: Playback (recordings)
- Add playback endpoints and UI.

Phase 9: FFmpeg fallback
- Only needed if VMS is not available.
