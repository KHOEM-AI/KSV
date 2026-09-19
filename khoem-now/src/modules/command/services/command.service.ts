/**
 * KSV — Command Service
 * Location: src/modules/command/services/command.service.ts
 *
 * Business Logic សម្រាប់វដ្តជីវិត Command
 * FLOW: created → pending → dispatched → acknowledged → success/failed
 */

import crypto from 'node:crypto';
import { commandRepository } from '../repositories/command.repository';
import type {
  DispatchCommandDto,
  CommandListQueryDto,
  CommandResponseDto,
} from '../dto/command.dto';

export class CommandService {
  private toResponse(c: any): CommandResponseDto {
    return {
      commandId: c.commandId,
      deviceId: c.deviceId,
      issuedByUserId: c.issuedByUserId,
      type: c.type,
      payload: c.payload,
      status: c.status,
      decision: c.decision,
      reasons: c.reasons ?? [],
      response: c.response,
      dispatchedAt: c.dispatchedAt?.toISOString(),
      acknowledgedAt: c.acknowledgedAt?.toISOString(),
      completedAt: c.completedAt?.toISOString(),
      createdAt: c.createdAt.toISOString(),
    };
  }

  async create(
    userId: string,
    orgId: string | undefined,
    dto: DispatchCommandDto,
    decision: 'ALLOW' | 'WARN' | 'BLOCK',
    reasons: string[]
  ): Promise<CommandResponseDto> {
    const commandId = `CMD-${crypto
      .randomBytes(6)
      .toString('hex')
      .toUpperCase()}`;

    const status = decision === 'BLOCK' ? 'blocked' : 'pending';

    const command = await commandRepository.create({
      commandId,
      deviceId: dto.deviceId,
      issuedByUserId: userId,
      orgId,
      type: dto.type,
      payload: dto.payload,
      status,
      decision,
      reasons,
    });

    return this.toResponse(command);
  }

  async list(
    orgId: string,
    query: CommandListQueryDto
  ): Promise<{ total: number; data: CommandResponseDto[] }> {
    // orgId always comes from the authenticated user, never from the
    // client-supplied query — a client-supplied orgId here would let a
    // user read another organization's commands.
    const { items, total } = await commandRepository.list({ ...query, orgId });
    return { total, data: items.map((c) => this.toResponse(c)) };
  }

  async listRecent(orgId: string, limit = 10): Promise<CommandResponseDto[]> {
    const items = await commandRepository.listRecent(orgId, limit);
    return items.map((c) => this.toResponse(c));
  }

  async getById(commandId: string, orgId: string): Promise<CommandResponseDto> {
    const c = await commandRepository.findByCommandId(commandId, orgId);
    if (!c) throw new Error('Command not found');
    return this.toResponse(c);
  }

  async markDispatched(commandId: string): Promise<void> {
    await commandRepository.updateStatus(commandId, 'dispatched', {
      dispatchedAt: new Date(),
    });
  }

  async markAcknowledged(commandId: string): Promise<void> {
    await commandRepository.updateStatus(commandId, 'acknowledged', {
      acknowledgedAt: new Date(),
    });
  }

  async markSuccess(
    commandId: string,
    response?: Record<string, unknown>
  ): Promise<void> {
    await commandRepository.updateStatus(commandId, 'success', {
      response,
      completedAt: new Date(),
    });
  }

  async markFailed(
    commandId: string,
    response?: Record<string, unknown>
  ): Promise<void> {
    await commandRepository.updateStatus(commandId, 'failed', {
      response,
      completedAt: new Date(),
    });
  }

  async markTimeout(commandId: string): Promise<void> {
    await commandRepository.updateStatus(commandId, 'timeout', {
      completedAt: new Date(),
    });
  }
}

export const commandService = new CommandService();
