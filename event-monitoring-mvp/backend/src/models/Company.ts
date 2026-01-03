import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  companyId: string;
  name: string;
  apiKey: string;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    companyId: {
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
    apiKey: {
      type: String,
      required: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ apiKey: 1 });
companySchema.index({ isActive: 1 });

export const Company = mongoose.model<ICompany>('Company', companySchema);
