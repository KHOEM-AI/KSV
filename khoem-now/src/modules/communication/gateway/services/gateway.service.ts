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
      ...dto,
    });

    return this.toResponse(gateway);
  }

  async listByOrg(orgId: string): Promise<GatewayResponseDto[]> {
    const list = await gatewayRepository.listByOrg(orgId);
    return list.map((g) => this.toResponse(g));
  }

  async getById(gatewayId: string): Promise<GatewayResponseDto> {
    const g = await gatewayRepository.findByGatewayId(gatewayId);
    if (!g) throw new Error('Gateway not found');
    return this.toResponse(g);
  }

  async update(
    gatewayId: string,
    dto: UpdateGatewayDto
  ): Promise<GatewayResponseDto> {
    const g = await gatewayRepository.update(gatewayId, dto as any);
    if (!g) throw new Error('Gateway not found');
    return this.toResponse(g);
  }

  async heartbeat(gatewayId: string): Promise<void> {
    await gatewayRepository.heartbeat(gatewayId);
  }

  async delete(gatewayId: string): Promise<void> {
    const ok = await gatewayRepository.delete(gatewayId);
    if (!ok) throw new Error('Gateway not found');
  }
}

export const gatewayService = new GatewayService();
