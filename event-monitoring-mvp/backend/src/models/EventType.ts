import mongoose, { Document, Schema } from 'mongoose';

export interface IEventType extends Document {
  typeId: string;
  name: string;
  subTypes: string[];
  severity: string;
  companyId?: mongoose.Types.ObjectId;
  isGlobal: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventTypeSchema = new Schema<IEventType>(
  {
    typeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    subTypes: [{
      type: String,
      trim: true
    }],
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical', 'emergency'],
      default: 'medium'
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: false
    },
    isGlobal: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

eventTypeSchema.index({ companyId: 1 });
eventTypeSchema.index({ isGlobal: 1 });
eventTypeSchema.index({ isActive: 1 });
eventTypeSchema.index({ name: 1 });

export const EventType = mongoose.model<IEventType>('EventType', eventTypeSchema);
