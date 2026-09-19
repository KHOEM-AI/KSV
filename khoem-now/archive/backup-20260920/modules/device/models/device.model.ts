/**
 * KSV — Device Model
 * Location: src/modules/device/models/device.model.ts
 */

import mongoose, { Schema, type Document } from 'mongoose';

export type DeviceStatus =
  | 'online'
  | 'offline'
  | 'warning'
  | 'maintenance'
  | 'pairing'
  | 'error'
  | 'decommissioned';

export type DeviceCategory =
  | 'home'
  | 'building'
  | 'vehicle'
  | 'industrial'
  | 'warehouse'
  | 'energy'
  | 'network'
  | 'other';

export interface IDevice extends Document {
  deviceId: string;
  deviceCode: string;
  name: string;
  type: string;
  category: DeviceCategory;
  status: DeviceStatus;
  protocol: string;
  ownerUserId: string;
  orgId?: string;
  site?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  latitude?: number;
  longitude?: number;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'home',
        'building',
        'vehicle',
        'industrial',
        'warehouse',
        'energy',
        'network',
        'other',
      ],
      default: 'other',
    },
    status: {
      type: String,
      enum: [
        'online',
        'offline',
        'warning',
        'maintenance',
        'pairing',
        'error',
        'decommissioned',
      ],
      default: 'offline',
    },
    protocol: { type: String, required: true },
    ownerUserId: { type: String, required: true, index: true },
    orgId: { type: String, index: true },
    site: String,
    firmwareVersion: String,
    serialNumber: { type: String, sparse: true },
    latitude: Number,
    longitude: Number,
    lastSeenAt: Date,
  },
  { timestamps: true }
);

DeviceSchema.index({ orgId: 1, status: 1 });
DeviceSchema.index({ latitude: 1, longitude: 1 });

export const Device =
  mongoose.models.Device ||
  mongoose.model<IDevice>('Device', DeviceSchema);
