/**
 * KSV — Protocol Service
 */

import crypto from 'node:crypto';
import { protocolRepository } from '../repositories/protocol.repository';
import type {
  CreateProtocolDto,
  UpdateProtocolDto,
  ProtocolResponseDto,
} from '../dto/protocol.dto';

export class ProtocolService {
  private toResponse(p: any): ProtocolResponseDto {
    return {
      protocolId: p.protocolId,
      code: p.code,
      name: p.name,
      category: p.category,
      enabled: p.enabled,
      description: p.description,
      createdAt: p.createdAt.toISOString(),
    };
  }

  async create(dto: CreateProtocolDto): Promise<ProtocolResponseDto> {
    const existing = await protocolRepository.findByCode(dto.code);
    if (existing) throw new Error('Protocol code already exists');

    const protocolId = `PRT-${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    const protocol = await protocolRepository.create({
      protocolId,
      ...dto,
    });

    return this.toResponse(protocol);
  }

  async listEnabled(): Promise<ProtocolResponseDto[]> {
    const list = await protocolRepository.listEnabled();
    return list.map((p) => this.toResponse(p));
  }

  async listAll(): Promise<ProtocolResponseDto[]> {
    const list = await protocolRepository.listAll();
    return list.map((p) => this.toResponse(p));
  }

  async getById(protocolId: string): Promise<ProtocolResponseDto> {
    const p = await protocolRepository.findByProtocolId(protocolId);
    if (!p) throw new Error('Protocol not found');
    return this.toResponse(p);
  }

  async update(
    protocolId: string,
    dto: UpdateProtocolDto
  ): Promise<ProtocolResponseDto> {
    const p = await protocolRepository.update(protocolId, dto as any);
    if (!p) throw new Error('Protocol not found');
    return this.toResponse(p);
  }

  async delete(protocolId: string): Promise<void> {
    const ok = await protocolRepository.delete(protocolId);
    if (!ok) throw new Error('Protocol not found');
  }
}

export const protocolService = new ProtocolService();
