/**
 * KSV — Gateway DTO
 */

import type { GatewayStatus, GatewayKind } from '../models/gateway.model';

export interface CreateGatewayDto {
  name: string;
  kind?: GatewayKind;
  site?: string;
  ipAddress?: string;
  port?: number;
  firmwareVersion?: string;
}

export interface UpdateGatewayDto {
  name?: string;
  status?: GatewayStatus;
  site?: string;
  ipAddress?: string;
  port?: number;
  firmwareVersion?: string;
}

export interface GatewayResponseDto {
  gatewayId: string;
  name: string;
  kind: GatewayKind;
  status: GatewayStatus;
  orgId: string;
  site?: string;
  ipAddress?: string;
  port?: number;
  firmwareVersion?: string;
  lastHeartbeatAt?: string;
  createdAt: string;
}
