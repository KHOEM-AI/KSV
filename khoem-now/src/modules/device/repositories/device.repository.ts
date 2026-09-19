/**
 * KSV — Device Repository
 * Location: src/modules/device/repositories/device.repository.ts
 */

import { Device, type IDevice } from '../models/device.model';
import type { DeviceListQueryDto } from '../dto/device.dto';

export class DeviceRepository {
  async findByDeviceId(deviceId: string): Promise<IDevice | null> {
    return Device.findOne({ deviceId });
  }

  // Org-scoped lookup — use this (not findByDeviceId) wherever the caller
  // is an authenticated user and must not see devices from other orgs.
  async findByDeviceIdAndOrg(
    deviceId: string,
    orgId: string
  ): Promise<IDevice | null> {
    return Device.findOne({ deviceId, orgId });
  }

  async findByDeviceCode(deviceCode: string): Promise<IDevice | null> {
    return Device.findOne({ deviceCode });
  }

  async list(
    query: DeviceListQueryDto
  ): Promise<{ items: IDevice[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.orgId) filter.orgId = query.orgId;
    if (query.site) filter.site = query.site;

    const limit = Math.min(query.limit ?? 50, 200);
    const offset = query.offset ?? 0;

    const [items, total] = await Promise.all([
      Device.find(filter).skip(offset).limit(limit).sort({ createdAt: -1 }),
      Device.countDocuments(filter),
    ]);

    return { items, total };
  }

  async listWithCoordinates(orgId?: string): Promise<IDevice[]> {
    const filter: Record<string, unknown> = {
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };
    if (orgId) filter.orgId = orgId;
    return Device.find(filter).limit(500);
  }

  async create(data: Partial<IDevice>): Promise<IDevice> {
    return Device.create(data);
  }

  async update(
    deviceId: string,
    data: Partial<IDevice>
  ): Promise<IDevice | null> {
    return Device.findOneAndUpdate(
      { deviceId },
      { $set: data },
      { new: true }
    );
  }

  async updateStatus(
    deviceCode: string,
    status: string
  ): Promise<IDevice | null> {
    return Device.findOneAndUpdate(
      { deviceCode },
      { $set: { status, lastSeenAt: new Date() } },
      { new: true }
    );
  }

  async delete(deviceId: string): Promise<boolean> {
    const result = await Device.deleteOne({ deviceId });
    return result.deletedCount === 1;
  }

  async countByOrg(orgId: string): Promise<number> {
    return Device.countDocuments({ orgId });
  }
}

export const deviceRepository = new DeviceRepository();
