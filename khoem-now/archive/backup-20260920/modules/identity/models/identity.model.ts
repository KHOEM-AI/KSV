/**
 * KSV — Identity Model
 * Location: src/modules/identity/models/identity.model.ts
 * 
 * Mongoose Schema សម្រាប់គណនីអ្នកប្រើ
 */

import mongoose, { Schema, type Document } from 'mongoose';

export interface IIdentity extends Document {
  userId: string;
  email: string;
  phone?: string;
  displayName: string;
  passwordHash: string;
  role: string;
  organizationId?: string;
  status: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IdentitySchema = new Schema<IIdentity>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, unique: true, sparse: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Viewer' },
    organizationId: { type: String, index: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Identity =
  mongoose.models.Identity || mongoose.model<IIdentity>('Identity', IdentitySchema);
