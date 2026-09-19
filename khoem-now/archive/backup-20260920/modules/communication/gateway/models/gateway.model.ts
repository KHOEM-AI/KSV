/**
 * KSV — Gateway Model
 * Location: src/modules/communication/gateway/models/gateway.model.ts
 *
 * Gateway = ចំណុចកណ្តាលភ្ជាប់រវាង Server និងឧបករណ៍
 */

import mongoose, { Schema, type Document } from 'mongoose';

export type GatewayStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type GatewayKind = 'local' | 'edge' | 'cloud' | 'hybrid';

export interface IGateway extends Document {
  gatewayId: string;
  name: string;
  kind: GatewayKind;
  status: GatewayStatus;
  orgId: string;
  site?: string;
  ipAddress?: string;
  port?: number;
  firmwareVersion?: string;
  lastHeartbeatAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GatewaySchema = new Schema<IGateway>(
  {
    gatewayId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    kind: {
      type: String,
      enum: ['local', 'edge', 'cloud', 'hybrid'],
      default: 'edge',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'error', 'maintenance'],
      default: 'offline',
    },
    orgId: { type: String, required: true, index: true },
    site: String,
    ipAddress: String,
    port: Number,
    firmwareVersion: String,
    lastHeartbeatAt: Date,
  },
  { timestamps: true }
);

GatewaySchema.index({ orgId: 1, status: 1 });

export const Gateway =
  mongoose.models.Gateway ||
  mongoose.model<IGateway>('Gateway', GatewaySchema);
