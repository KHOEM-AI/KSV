/**
 * KSV — Safety Model
 * Location: src/modules/safety/models/safety.model.ts
 *
 * Safety Engine — ត្រួតពិនិត្យសុវត្ថិភាពមុនបញ្ជា
 * RULE: រាល់ Command ដែលប៉ះពាល់សុវត្ថិភាព ត្រូវឆ្លងកាត់ទីនេះ
 */

import mongoose, { Schema, type Document } from 'mongoose';

export type SafetyDecision = 'ALLOW' | 'WARN' | 'BLOCK';
export type SafetySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ISafetyRule extends Document {
  ruleId: string;
  name: string;
  description?: string;
  orgId?: string;
  enabled: boolean;
  severity: SafetySeverity;
  condition: Record<string, unknown>;
  decision: SafetyDecision;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISafetyLog extends Document {
  logId: string;
  ruleId?: string;
  orgId?: string;
  deviceId: string;
  commandId?: string;
  userId?: string;
  decision: SafetyDecision;
  severity: SafetySeverity;
  reasons: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyRuleSchema = new Schema<ISafetyRule>(
  {
    ruleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: String,
    orgId: { type: String, index: true },
    enabled: { type: Boolean, default: true },
    severity: {
      type: String,
      enum: ['info', 'low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    condition: { type: Schema.Types.Mixed, required: true },
    decision: {
      type: String,
      enum: ['ALLOW', 'WARN', 'BLOCK'],
      default: 'WARN',
    },
    message: String,
  },
  { timestamps: true }
);

const SafetyLogSchema = new Schema<ISafetyLog>(
  {
    logId: { type: String, required: true, unique: true, index: true },
    ruleId: { type: String, index: true },
    orgId: { type: String, index: true },
    deviceId: { type: String, required: true, index: true },
    commandId: { type: String, index: true },
    userId: { type: String, index: true },
    decision: {
      type: String,
      enum: ['ALLOW', 'WARN', 'BLOCK'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    reasons: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

SafetyLogSchema.index({ deviceId: 1, createdAt: -1 });

export const SafetyRule =
  mongoose.models.SafetyRule ||
  mongoose.model<ISafetyRule>('SafetyRule', SafetyRuleSchema);

export const SafetyLog =
  mongoose.models.SafetyLog ||
  mongoose.model<ISafetyLog>('SafetyLog', SafetyLogSchema);
