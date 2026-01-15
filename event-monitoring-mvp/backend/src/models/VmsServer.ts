import mongoose, { Document, Schema } from 'mongoose';

/**
 * VMS Server Model
 *
 * Why this exists:
 * - Our current system stores camera metadata + RTSP URLs.
 * - A VMS (Video Management System) is a separate service that *manages* live streams + recordings.
 * - To integrate cleanly, we first need to store VMS server connection details in MongoDB.
 *
 * This model represents ONE VMS instance (e.g., Shinobi / ZoneMinder / Agent DVR).
 * Cameras will later reference a VmsServer via `camera.vms.serverId`.
 */


// TEST-ONLY: provider list is intentionally small for early integration testing.
export type VmsProvider = 'shinobi' | 'zoneminder' | 'agentdvr' | 'other';

export interface IVmsServer extends Document {
  name: string;                 // Friendly label, e.g. "Local Shinobi"
  provider: VmsProvider;        // Which VMS type this server is
  baseUrl: string;              // Base URL of the VMS server (http://host:port)
auth?: {
  /**
   * Different VMS providers use different auth styles:
   * - Some use API keys/tokens
   * - Some use username/password
   *
   * Shinobi needs BOTH:
   * - apiKey (API KEY)
   * - groupKey (GROUP KEY)
   *
   * NOTE (security): For production, secrets should be encrypted at rest or stored in a vault.
   */
  apiKey?: string;
  groupKey?: string; // Shinobi GROUP KEY
  username?: string;
  password?: string;
};

  isActive: boolean;            // Allows disabling a VMS server without deleting it
  createdAt: Date;
  updatedAt: Date;
}

const vmsServerSchema = new Schema<IVmsServer>(
  {
    name: {
      type: String,
      required: [true, 'VMS server name is required'],
      trim: true,
      maxlength: [100, 'VMS server name must be less than 100 characters'],
    },
    provider: {
      type: String,
      enum: ['shinobi', 'zoneminder', 'agentdvr', 'other'],
      required: [true, 'VMS provider is required'],
      default: 'other',
    },
    baseUrl: {
      type: String,
      required: [true, 'VMS baseUrl is required'],
      trim: true,
      match: [/^https?:\/\/.+/, 'baseUrl must be a valid http(s) URL'],
    },
    auth: {
      apiKey: { type: String },
      groupKey: { type: String },
      username: { type: String },
      password: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,

    /**
     * Security: never serialize credentials back to clients.
     * Controllers should still be careful, but this prevents accidental leakage.
     */
    toJSON: {
      transform: (_doc: unknown, ret: any) => {
        delete ret.auth;
        return ret;
      },
    },
    toObject: {
      transform: (_doc: unknown, ret: any) => {
        delete ret.auth;
        return ret;
      },
    },
  }
);

// Helpful indexes
vmsServerSchema.index({ provider: 1 });
vmsServerSchema.index({ isActive: 1 });

export const VmsServer = mongoose.model<IVmsServer>('VmsServer', vmsServerSchema);
