/**
 * KSV — Organization Model
 * Location: src/modules/organization/models/organization.model.ts
 */

import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type OrgRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer';

export interface IOrganization extends Document {
  orgId: string;
  name: string;
  slug: string;
  ownerUserId: string;
  members: Array<{
    userId: string;
    role: OrgRole;
    joinedAt: Date;
  }>;
  status: 'active' | 'suspended' | 'deleted';
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    orgId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    ownerUserId: { type: String, required: true, index: true },
    members: [
      {
        userId: { type: String, required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'manager', 'operator', 'viewer'],
          default: 'viewer',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
  },
  { timestamps: true }
);

OrganizationSchema.index({ 'members.userId': 1 });

export const Organization =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', OrganizationSchema);
