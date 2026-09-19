/**
 * KSV — Gateway Service
 */

import crypto from 'node:crypto';
import { gatewayRepository } from '../repositories/gateway.repository';
import type {
  CreateGatewayDto,
  UpdateGatewayDto,
  GatewayResponseDto,
} from '../dto/gateway.dto';

export class GatewayService {
  private toResponse(g: any): GatewayResponseDto {
    return {
      gatewayId: g.gatewayId,
      name: g.name,
      kind: g.kind,
      status: g.status,
      orgId: g.orgId,
      site: g.site,
      ipAddress: g.ipAddress,
      port: g.port,
      firmwareVersion: g.firmwareVersion,
      lastHeartbeatAt: g.lastHeartbeatAt?.toISOString(),
      createdAt: g.createdAt.toISOString(),
    };
  }

  async create(
    orgId: string,
    dto: CreateGatewayDto
  ): Promise<GatewayResponseDto> {
    const gatewayId = `GW-${crypto
      .randomBytes(6)
      .toString('hex')
      .toUpperCase()}`;

    const gateway = await gatewayRepository.create({
      gatewayId,
      orgId,
      name: dto.name,
      kind: dto.kind,
      site: dto.site,
      ipAddress: dto.ipAddress,
      port: dto.port,
      firmwareVersion: dto.firmwareVersion,
    });

    return this.toResponse(gateway);
  }

  async listByOrg(orgId: string): Promise<GatewayResponseDto[]> {
    const list = await gatewayRepository.listByOrg(orgId);
    return list.map((g) => this.toResponse(g));
  }

  async getById(
    gatewayId: string,
    orgId: string
  ): Promise<GatewayResponseDto> {
    const g = await gatewayRepository.findByGatewayId(gatewayId, orgId);
    if (!g) throw new Error('Gateway not found');
    return this.toResponse(g);
  }

  async update(
    gatewayId: string,
    orgId: string,
    dto: UpdateGatewayDto
  ): Promise<GatewayResponseDto> {
    const allowed: UpdateGatewayDto = {};
    const keys = [
      'name',
      'status',
      'site',
      'ipAddress',
      'port',
      'firmwareVersion',
    ] as const;
    for (const k of keys) {
      if (dto[k] !== undefined) (allowed as any)[k] = dto[k];
    }
    const g = await gatewayRepository.update(gatewayId, orgId, allowed as any);
    if (!g) throw new Error('Gateway not found');
    return this.toResponse(g);
  }

  async heartbeat(gatewayId: string, orgId: string): Promise<void> {
    const g = await gatewayRepository.heartbeat(gatewayId, orgId);
    if (!g) throw new Error('Gateway not found');
  }

  async delete(gatewayId: string, orgId: string): Promise<void> {
    const ok = await gatewayRepository.delete(gatewayId, orgId);
    if (!ok) throw new Error('Gateway not found');
  }
}

export const gatewayService = new GatewayService();
