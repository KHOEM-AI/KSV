/**
 * KSV — Device DTO
 * Location: src/modules/device/dto/device.dto.ts
 */

import type { DeviceStatus, DeviceCategory } from '../models/device.model';

export interface RegisterDeviceDto {
  name: string;
  type: string;
  category: DeviceCategory;
  protocol: string;
  serialNumber?: string;
  site?: string;
  orgId?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDeviceDto {
  name?: string;
  status?: DeviceStatus;
  firmwareVersion?: string;
  site?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeviceResponseDto {
  deviceId: string;
  deviceCode: string;
  name: string;
  type: string;
  category: DeviceCategory;
  status: DeviceStatus;
  protocol: string;
  ownerUserId: string;
  orgId?: string;
  site?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  latitude?: number;
  longitude?: number;
  lastSeenAt?: string;
  createdAt: string;
}

export interface DeviceListQueryDto {
  status?: DeviceStatus;
  category?: DeviceCategory;
  orgId?: string;
  site?: string;
  limit?: number;
  offset?: number;
}
