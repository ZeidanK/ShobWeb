import mongoose, { Document, Schema } from 'mongoose';

// Interface for AI Detection
export interface IAIDetection extends Document {
  _id: string;
  cameraId: mongoose.Types.ObjectId;
  detectionId: string; // Unique AI detection ID
  timestamp: Date;
  type: 'person' | 'vehicle' | 'unknown_object' | 'motion';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  location: {
    coordinates: [number, number]; // [longitude, latitude] - Camera location
    estimatedPosition?: [number, number]; // Estimated object position if available
    address?: string;
  };
  metadata: {
    aiModel: string;
    processingTime: number;
    frameNumber: number;
    objectProperties?: {
      color?: string;
      size?: string;
      direction?: string;
      speed?: number;
    };
  };
  status: 'pending_review' | 'dismissed' | 'promoted_to_event';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  promotedEventId?: mongoose.Types.ObjectId;
  snapshots: {
    fullFrame: string; // Image URL
    croppedObject: string; // Cropped detection URL
    thumbnail: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for AI Detection
const aiDetectionSchema = new Schema<IAIDetection>({
  cameraId: {
    type: Schema.Types.ObjectId,
    ref: 'Camera',
    required: true,
    index: true
  },
  detectionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['person', 'vehicle', 'unknown_object', 'motion'],
    required: true,
    index: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    index: true
  },
  boundingBox: {
    x: {
      type: Number,
      required: true,
      min: 0
    },
    y: {
      type: Number,
      required: true,
      min: 0
    },
    width: {
      type: Number,
      required: true,
      min: 0
    },
    height: {
      type: Number,
      required: true,
      min: 0
    }
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere', // Enable geospatial queries
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: 'Coordinates must be [longitude, latitude]'
      }
    },
    estimatedPosition: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: 'Estimated position must be [longitude, latitude]'
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  metadata: {
    aiModel: {
      type: String,
      required: true,
      trim: true
    },
    processingTime: {
      type: Number,
      required: true,
      min: 0
    },
    frameNumber: {
      type: Number,
      required: true,
      min: 0
    },
    objectProperties: {
      color: {
        type: String,
        trim: true
      },
      size: {
        type: String,
        trim: true
      },
      direction: {
        type: String,
        trim: true
      },
      speed: {
        type: Number,
        min: 0
      }
    }
  },
  status: {
    type: String,
    enum: ['pending_review', 'dismissed', 'promoted_to_event'],
    default: 'pending_review',
    required: true,
    index: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  promotedEventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  snapshots: {
    fullFrame: {
      type: String,
      required: true,
      trim: true
    },
    croppedObject: {
      type: String,
      required: true,
      trim: true
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true
    }
  }
}, {
  timestamps: true,
  collection: 'ai_detections'
});

// Indexes for efficient querying
aiDetectionSchema.index({ cameraId: 1, timestamp: -1 });
aiDetectionSchema.index({ status: 1, timestamp: -1 });
aiDetectionSchema.index({ type: 1, confidence: -1 });
aiDetectionSchema.index({ 'location.coordinates': '2dsphere' });

// Compound index for common queries
aiDetectionSchema.index({ 
  status: 1, 
  type: 1, 
  confidence: -1, 
  timestamp: -1 
});

// Pre-save middleware to validate review data
aiDetectionSchema.pre('save', function(next) {
  if (this.status === 'dismissed' || this.status === 'promoted_to_event') {
    if (!this.reviewedBy || !this.reviewedAt) {
      return next(new Error('Reviewed detections must have reviewedBy and reviewedAt fields'));
    }
  }
  
  if (this.status === 'promoted_to_event' && !this.promotedEventId) {
    return next(new Error('Promoted detections must have promotedEventId'));
  }
  
  next();
});

// Instance methods
aiDetectionSchema.methods.promoteToEvent = function(eventData: any, reviewerId: string) {
  this.status = 'promoted_to_event';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  // promotedEventId will be set after event creation
  return this.save();
};

aiDetectionSchema.methods.dismiss = function(reviewerId: string, reason?: string) {
  this.status = 'dismissed';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (reason) {
    this.metadata.dismissReason = reason;
  }
  return this.save();
};

// Static methods for common queries
aiDetectionSchema.statics.findPendingByCamera = function(cameraId: string) {
  return this.find({ 
    cameraId, 
    status: 'pending_review' 
  }).sort({ timestamp: -1 });
};

aiDetectionSchema.statics.findInRadius = function(
  coordinates: [number, number], 
  radiusMeters: number,
  filters: any = {}
) {
  const query = {
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusMeters
      }
    },
    ...filters
  };
  
  return this.find(query).sort({ timestamp: -1 });
};

aiDetectionSchema.statics.getDetectionStats = function(dateRange?: { start: Date; end: Date }) {
  const matchStage: any = {};
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        types: { $addToSet: '$type' }
      }
    }
  ]);
};

export const AIDetection = mongoose.model<IAIDetection>('AIDetection', aiDetectionSchema);
export default AIDetection;