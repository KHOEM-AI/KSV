/**
 * KSV — Protocol Model
 * Location: src/modules/communication/protocol/models/protocol.model.ts
 *
 * Protocol Registry — Bluetooth, Wi-Fi, MQTT, IR, Zigbee, LoRaWAN, ...
 */

import mongoose, { Schema, type Document } from 'mongoose';

export interface IProtocol extends Document {
  protocolId: string;
  code: string;
  name: string;
  category: 'short-range' | 'long-range' | 'wired' | 'cloud';
  enabled: boolean;
  description?: string;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ProtocolSchema = new Schema<IProtocol>(
  {
    protocolId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['short-range', 'long-range', 'wired', 'cloud'],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    description: String,
    config: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Protocol =
  mongoose.models.Protocol ||
  mongoose.model<IProtocol>('Protocol', ProtocolSchema);
