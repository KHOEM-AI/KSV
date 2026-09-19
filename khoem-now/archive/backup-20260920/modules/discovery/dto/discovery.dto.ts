/**
 * KSV — Discovery DTO
 * Location: src/modules/discovery/dto/discovery.dto.ts
 */

import type { DiscoveryStatus } from '../models/discovery.model';

export interface AnnounceDiscoveryDto {
  deviceCode: string;
  name: string;
  type: string;
  protocol: string;
  macAddress?: string;
  ipAddress?: string;
  signalStrength?: number;
  metadata?: Record<string, unknown>;
}

export interface IgnoreDiscoveryDto {
  reason?: string;
}

export interface BlockDiscoveryDto {
  reason?: string;
}

export interface DiscoveryResponseDto {
  discoveryId: string;
  deviceCode: string;
  name: string;
  type: string;
  protocol: string;
  macAddress?: string;
  ipAddress?: string;
  status: DiscoveryStatus;
  signalStrength?: number;
  expiresAt: string;
  createdAt: string;
}

export interface DiscoveryListQueryDto {
  status?: DiscoveryStatus;
  limit?: number;
  offset?: number;
}
