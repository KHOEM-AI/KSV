/**
 * KSV — Device Service
 * Location: src/modules/device/services/device.service.ts
 *
 * Business Logic សម្រាប់ឧបករណ៍
 * NOTE: KSV ដឹង WHAT ឧបករណ៍ធ្វើបាន មិនត្រឹមតែមានវាទេ
 */

import crypto from 'node:crypto';
import { deviceRepository } from '../repositories/device.repository';
import type {
  RegisterDeviceDto,
  UpdateDeviceDto,
  DeviceListQueryDto,
  DeviceResponseDto,
} from '../dto/device.dto';

export class DeviceService {
  private toResponse(d: any): DeviceResponseDto {
    return {
      deviceId: d.deviceId,
      deviceCode: d.deviceCode,
      name: d.name,
      type: d.type,
      category: d.category,
      status: d.status,
      protocol: d.protocol,
      ownerUserId: d.ownerUserId,
      orgId: d.orgId,
      site: d.site,
      firmwareVersion: d.firmwareVersion,
      serialNumber: d.serialNumber,
      latitude: d.latitude,
      longitude: d.longitude,
      lastSeenAt: d.lastSeenAt?.toISOString(),
      createdAt: d.createdAt.toISOString(),
    };
  }

  async register(
    ownerUserId: string,
    dto: RegisterDeviceDto
  ): Promise<DeviceResponseDto> {
    if (dto.serialNumber) {
      const existing = await deviceRepository.findByDeviceCode(dto.serialNumber);
      if (existing) throw new Error('Device serial number already registered');
    }

    const deviceId = `DEV-${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;
    const deviceCode = dto.serialNumber || deviceId;

    const device = await deviceRepository.create({
      deviceId,
      deviceCode,
      name: dto.name,
      type: dto.type,
      category: dto.category,
      protocol: dto.protocol,
      ownerUserId,
      orgId: dto.orgId,
      site: dto.site,
      serialNumber: dto.serialNumber,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: 'pairing',
    });

    return this.toResponse(device);
  }

  async list(
    orgId: string,
    query: DeviceListQueryDto
  ): Promise<{ total: number; data: DeviceResponseDto[] }> {
    // orgId always comes from the authenticated user, never from the
    // client-supplied query.
    const { items, total } = await deviceRepository.list({ ...query, orgId });
    return { total, data: items.map((d) => this.toResponse(d)) };
  }

  async getById(deviceId: string, orgId: string): Promise<DeviceResponseDto> {
    const device = await deviceRepository.findByDeviceIdAndOrg(deviceId, orgId);
    if (!device) throw new Error('Device not found');
    return this.toResponse(device);
  }

  async update(
    deviceId: string,
    orgId: string,
    dto: UpdateDeviceDto
  ): Promise<DeviceResponseDto> {
    const device = await deviceRepository.update(deviceId, orgId, dto as any);
    if (!device) throw new Error('Device not found');
    return this.toResponse(device);
  }

  async updateStatusFromMqtt(
    deviceCode: string,
    status: string
  ): Promise<void> {
    const device = await deviceRepository.updateStatus(deviceCode, status);
    if (!device) {
      console.warn(`[Device] Unknown deviceCode: ${deviceCode}`);
    }
  }

  async delete(deviceId: string, orgId: string): Promise<void> {
    const ok = await deviceRepository.delete(deviceId, orgId);
    if (!ok) throw new Error('Device not found');
  }

  async getMapDevices(orgId: string): Promise<DeviceResponseDto[]> {
    const devices = await deviceRepository.listWithCoordinates(orgId);
    return devices.map((d) => this.toResponse(d));
  }

  async countByOrg(orgId: string): Promise<number> {
    return deviceRepository.countByOrg(orgId);
  }
}

export const deviceService = new DeviceService();
