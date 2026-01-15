import mongoose, { Document, Schema } from 'mongoose';

export interface ICamera extends Document {
  name: string;
  description?: string;
  streamUrl: string;
  location: {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  };

  status: 'online' | 'offline' | 'maintenance';
  type: 'ip' | 'analog' | 'usb';
  settings: {
    resolution: string;
    fps: number;
    recordingEnabled: boolean;
  };

   vms?: {
    provider: 'shinobi' | 'zoneminder' | 'agentdvr' | 'other';
    serverId?: mongoose.Types.ObjectId; // ref: VmsServer
    monitorId?: string; // provider-specific id for the camera/monitor inside the VMS
    lastSyncAt?: Date;  // last time we synced/connected this camera to the VMS
  };

   isDeleted: boolean;
   lastModified?: Date;
   lastSeen?: Date;
   isActive: boolean;
   createdBy: mongoose.Types.ObjectId;
   createdAt: Date;
   updatedAt: Date;
}

const cameraSchema = new Schema<ICamera>(
  {
    name: {
      type: String,
      required: [true, 'Camera name is required'],
      trim: true,
      maxlength: [100, 'Camera name must be less than 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description must be less than 500 characters']
    },
    streamUrl: {
      type: String,
      required: [true, 'Stream URL is required'],
      match: [
        /^(rtsp|http|https):\/\/.+/,
        'Stream URL must be a valid RTSP, HTTP, or HTTPS URL'
      ]
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
          required: true,
        },
        coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coordinates: number[]) {
            return (
              coordinates.length === 2 &&
              coordinates[0] >= -180 && coordinates[0] <= 180 &&
              coordinates[1] >= -90 && coordinates[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
      address: { type: String },
    },

    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'offline'
    },
    type: {
      type: String,
      enum: ['ip', 'analog', 'usb'],
      default: 'ip'
    },
    settings: {
      resolution: {
        type: String,
        default: '1920x1080'
      },
      fps: {
        type: Number,
        default: 30,
        min: 1,
        max: 60
      },
      recordingEnabled: {
        type: Boolean,
        default: false
      }
    },
             /**
     * VMS mapping block
     * Why: allows attaching a camera to a specific VMS server instance + monitor id,
     * so later we can request live/playback URLs from the VMS instead of trying to play RTSP directly in-browser.
     */
    vms: {
      provider: {
        type: String,
        enum: ['shinobi', 'zoneminder', 'agentdvr', 'other'],
        default: 'other',
      },
      serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VmsServer',
      },
      monitorId: {
        type: String,
      },
      lastSyncAt: {
        type: Date,
      },
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },
    lastModified: {
      type: Date
    },
    lastSeen: {
      type: Date
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
cameraSchema.index({ location: '2dsphere' });
cameraSchema.index({ status: 1 });
cameraSchema.index({ isActive: 1 });
cameraSchema.index({ createdBy: 1 });
cameraSchema.index({ 'vms.serverId': 1 });
cameraSchema.index({ 'vms.provider': 1 });


export const Camera = mongoose.model<ICamera>('Camera', cameraSchema);