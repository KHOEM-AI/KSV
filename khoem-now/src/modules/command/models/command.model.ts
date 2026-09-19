/**
 * KSV — Command Model
 * Location: src/modules/command/models/command.model.ts
 *
 * បញ្ជាដែលបញ្ជូនទៅឧបករណ៍
 * RULE: គ្រប់ Command ត្រូវឆ្លងកាត់ Auth → Authorization → Safety
 */

import mongoose, { Schema, type Document } from 'mongoose';

export type CommandStatus =
  | 'created'
  | 'pending'
  | 'dispatched'
  | 'acknowledged'
  | 'success'
  | 'failed'
  | 'blocked'
  | 'timeout';

export type CommandDecision = 'ALLOW' | 'WARN' | 'BLOCK';

export interface ICommand extends Document {
  commandId: string;
  deviceId: string;
  issuedByUserId: string;
  orgId?: string;
  type: string;
  payload?: Record<string, unknown>;
  status: CommandStatus;
  decision: CommandDecision;
  reasons: string[];
  response?: Record<string, unknown>;
  dispatchedAt?: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommandSchema = new Schema<ICommand>(
  {
    commandId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: { type: String, required: true, index: true },
    issuedByUserId: { type: String, required: true, index: true },
    orgId: { type: String, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: [
        'created',
        'pending',
        'dispatched',
        'acknowledged',
        'success',
        'failed',
        'blocked',
        'timeout',
      ],
      default: 'created',
    },
    decision: {
      type: String,
      enum: ['ALLOW', 'WARN', 'BLOCK'],
      default: 'ALLOW',
    },
    reasons: [{ type: String }],
    response: { type: Schema.Types.Mixed },
    dispatchedAt: Date,
    acknowledgedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

CommandSchema.index({ deviceId: 1, createdAt: -1 });
CommandSchema.index({ status: 1, createdAt: -1 });

export const Command =
  mongoose.models.Command ||
  mongoose.model<ICommand>('Command', CommandSchema);
