/**
 * KSV — Discovery Model
 * Location: src/modules/discovery/models/discovery.model.ts
 *
 * រកឃើញឧបករណ៍ថ្មីៗនៅលើ Network
 * NOTE: ការរកឃើញមិនមែនការអនុញ្ញាត — Discovery ≠ Authorization
 */

import mongoose, { Schema, type Document } from 'mongoose';

export type DiscoveryStatus =
  | 'pending'
  | 'paired'
  | 'ignored'
  | 'expired'
  | 'blocked';

export interface IDiscovery extends Document {
  discoveryId: string;
  deviceCode: string;
  name: string;
  type: string;
  protocol: string;
  macAddress?: string;
  ipAddress?: string;
  discoveredByUserId?: string;
  orgId?: string;
  status: DiscoveryStatus;
  signalStrength?: number;
  metadata?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscoverySchema = new Schema<IDiscovery>(
  {
    discoveryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceCode: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    protocol: { type: String, required: true },
    macAddress: { type: String, sparse: true },
    ipAddress: { type: String, sparse: true },
    discoveredByUserId: { type: String, index: true },
    orgId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'paired', 'ignored', 'expired', 'blocked'],
      default: 'pending',
    },
    signalStrength: Number,
    metadata: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// TTL Index — លុបចោលស្វ័យប្រវត្តិពេលផុតកំណត់
DiscoverySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
DiscoverySchema.index({ orgId: 1, status: 1 });

export const Discovery =
  mongoose.models.Discovery ||
  mongoose.model<IDiscovery>('Discovery', DiscoverySchema);
