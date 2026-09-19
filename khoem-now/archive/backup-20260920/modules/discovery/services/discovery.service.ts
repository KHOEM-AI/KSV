/**
 * KSV — Discovery Service
 * Location: src/modules/discovery/services/discovery.service.ts
 *
 * Business Logic សម្រាប់ការរកឃើញឧបករណ៍
 * RULE: Discovery ≠ Authorization — ការរកឃើញមិនផ្ដល់សិទ្ធិបញ្ជា
 */

import crypto from 'node:crypto';
import { discoveryRepository } from '../repositories/discovery.repository';
import type {
  AnnounceDiscoveryDto,
  DiscoveryListQueryDto,
  DiscoveryResponseDto,
} from '../dto/discovery.dto';

const DISCOVERY_TTL_MS = 5 * 60 * 1000; // 5 នាទី

export class DiscoveryService {
  private toResponse(d: any): DiscoveryResponseDto {
    return {
      discoveryId: d.discoveryId,
      deviceCode: d.deviceCode,
      name: d.name,
      type: d.type,
      protocol: d.protocol,
      macAddress: d.macAddress,
      ipAddress: d.ipAddress,
      status: d.status,
      signalStrength: d.signalStrength,
      expiresAt: d.expiresAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    };
  }

  async announce(
    userId: string,
    orgId: string,
    dto: AnnounceDiscoveryDto
  ): Promise<DiscoveryResponseDto> {
    // បើមាន Pending រួចហើយ → Update ជំនួសបង្កើតថ្មី
    const existing = await discoveryRepository.findPendingByDeviceCode(
      dto.deviceCode,
      orgId
    );
    if (existing) {
      const updated = await discoveryRepository.updateStatus(
        existing.discoveryId,
        orgId,
        'pending'
      );
      return this.toResponse(updated);
    }

    const discoveryId = `DSC-${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    const discovery = await discoveryRepository.create({
      discoveryId,
      deviceCode: dto.deviceCode,
      name: dto.name,
      type: dto.type,
      protocol: dto.protocol,
      macAddress: dto.macAddress,
      ipAddress: dto.ipAddress,
      signalStrength: dto.signalStrength,
      metadata: dto.metadata,
      discoveredByUserId: userId,
      orgId,
      status: 'pending',
      expiresAt: new Date(Date.now() + DISCOVERY_TTL_MS),
    });

    return this.toResponse(discovery);
  }

  async list(
    orgId: string,
    query: DiscoveryListQueryDto
  ): Promise<{ total: number; data: DiscoveryResponseDto[] }> {
    const { items, total } = await discoveryRepository.list(query, orgId);
    return { total, data: items.map((d) => this.toResponse(d)) };
  }

  async getById(
    discoveryId: string,
    orgId: string
  ): Promise<DiscoveryResponseDto> {
    const d = await discoveryRepository.findByDiscoveryId(discoveryId, orgId);
    if (!d) throw new Error('Discovery not found');
    return this.toResponse(d);
  }

  async ignore(
    discoveryId: string,
    orgId: string
  ): Promise<DiscoveryResponseDto> {
    const d = await discoveryRepository.updateStatus(
      discoveryId,
      orgId,
      'ignored'
    );
    if (!d) throw new Error('Discovery not found');
    return this.toResponse(d);
  }

  async block(
    discoveryId: string,
    orgId: string
  ): Promise<DiscoveryResponseDto> {
    const d = await discoveryRepository.updateStatus(
      discoveryId,
      orgId,
      'blocked'
    );
    if (!d) throw new Error('Discovery not found');
    return this.toResponse(d);
  }

  async markAsPaired(discoveryId: string, orgId: string): Promise<void> {
    await discoveryRepository.updateStatus(discoveryId, orgId, 'paired');
  }

  async remove(discoveryId: string, orgId: string): Promise<void> {
    const ok = await discoveryRepository.delete(discoveryId, orgId);
    if (!ok) throw new Error('Discovery not found');
  }

  async cleanupExpired(): Promise<number> {
    return discoveryRepository.deleteExpired();
  }
}

export const discoveryService = new DiscoveryService();
