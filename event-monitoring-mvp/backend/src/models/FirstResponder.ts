import mongoose, { Document, Schema } from 'mongoose';

export interface IFirstResponder extends Document {
  frId: string;
  phone: string;
  name: string;
  role: string;
  companyId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const firstResponderSchema = new Schema<IFirstResponder>(
  {
    frId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
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
    role: {
      type: String,
      required: true,
      trim: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
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

firstResponderSchema.index({ phone: 1 });
firstResponderSchema.index({ companyId: 1 });
firstResponderSchema.index({ isActive: 1 });

export const FirstResponder = mongoose.model<IFirstResponder>('FirstResponder', firstResponderSchema);
