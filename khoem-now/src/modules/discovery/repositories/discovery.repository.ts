/**
 * KSV — Discovery Repository
 * Location: src/modules/discovery/repositories/discovery.repository.ts
 */

import { Discovery, type IDiscovery } from '../models/discovery.model';
import type { DiscoveryListQueryDto } from '../dto/discovery.dto';

export class DiscoveryRepository {
  async findByDiscoveryId(
    discoveryId: string
  ): Promise<IDiscovery | null> {
    return Discovery.findOne({ discoveryId });
  }

  async findPendingByDeviceCode(
    deviceCode: string
  ): Promise<IDiscovery | null> {
    return Discovery.findOne({ deviceCode, status: 'pending' });
  }

  async list(
    query: DiscoveryListQueryDto
  ): Promise<{ items: IDiscovery[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.orgId) filter.orgId = query.orgId;

    const limit = Math.min(query.limit ?? 50, 200);
    const offset = query.offset ?? 0;

    const [items, total] = await Promise.all([
      Discovery.find(filter).skip(offset).limit(limit).sort({ createdAt: -1 }),
      Discovery.countDocuments(filter),
    ]);

    return { items, total };
  }

  async create(data: Partial<IDiscovery>): Promise<IDiscovery> {
    return Discovery.create(data);
  }

  async updateStatus(
    discoveryId: string,
    status: string
  ): Promise<IDiscovery | null> {
    return Discovery.findOneAndUpdate(
      { discoveryId },
      { $set: { status } },
      { new: true }
    );
  }

  async delete(discoveryId: string): Promise<boolean> {
    const result = await Discovery.deleteOne({ discoveryId });
    return result.deletedCount === 1;
  }

  async deleteExpired(): Promise<number> {
    const result = await Discovery.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount ?? 0;
  }
}

export const discoveryRepository = new DiscoveryRepository();
