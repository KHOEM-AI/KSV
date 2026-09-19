/**
 * KSV — Identity Repository
 * Location: src/modules/identity/repositories/identity.repository.ts
 * 
 * ទាញទិន្នន័យពី Database (មិនមាន Business Logic)
 */

import { Identity, type IIdentity } from '../models/identity.model';

export class IdentityRepository {
  async findByUserId(userId: string): Promise<IIdentity | null> {
    return Identity.findOne({ userId });
  }

  async findByEmail(email: string): Promise<IIdentity | null> {
    return Identity.findOne({ email: email.toLowerCase() });
  }

  async create(data: Partial<IIdentity>): Promise<IIdentity> {
    return Identity.create(data);
  }

  async update(
    userId: string,
    data: Partial<IIdentity>
  ): Promise<IIdentity | null> {
    return Identity.findOneAndUpdate({ userId }, { $set: data }, { new: true });
  }

  async delete(userId: string): Promise<boolean> {
    const result = await Identity.deleteOne({ userId });
    return result.deletedCount === 1;
  }

  async listAll(limit = 50, offset = 0): Promise<IIdentity[]> {
    return Identity.find().skip(offset).limit(limit).sort({ createdAt: -1 });
  }
}

export const identityRepository = new IdentityRepository();
