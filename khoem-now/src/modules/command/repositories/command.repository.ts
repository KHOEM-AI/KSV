/**
 * KSV — Command Repository
 * Location: src/modules/command/repositories/command.repository.ts
 */

import { Command, type ICommand } from '../models/command.model';
import type { CommandListQueryDto } from '../dto/command.dto';

export class CommandRepository {
  async findByCommandId(
    commandId: string
  ): Promise<ICommand | null> {
    return Command.findOne({ commandId });
  }

  async list(
    query: CommandListQueryDto
  ): Promise<{ items: ICommand[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.deviceId) filter.deviceId = query.deviceId;
    if (query.status) filter.status = query.status;
    if (query.issuedByUserId) filter.issuedByUserId = query.issuedByUserId;
    if (query.orgId) filter.orgId = query.orgId;

    const limit = Math.min(query.limit ?? 50, 200);
    const offset = query.offset ?? 0;

    const [items, total] = await Promise.all([
      Command.find(filter).skip(offset).limit(limit).sort({ createdAt: -1 }),
      Command.countDocuments(filter),
    ]);

    return { items, total };
  }

  async listRecent(limit = 10): Promise<ICommand[]> {
    return Command.find().sort({ createdAt: -1 }).limit(limit);
  }

  async create(data: Partial<ICommand>): Promise<ICommand> {
    return Command.create(data);
  }

  async updateStatus(
    commandId: string,
    status: string,
    extra: Partial<ICommand> = {}
  ): Promise<ICommand | null> {
    return Command.findOneAndUpdate(
      { commandId },
      { $set: { status, ...extra } },
      { new: true }
    );
  }

  async delete(commandId: string): Promise<boolean> {
    const result = await Command.deleteOne({ commandId });
    return result.deletedCount === 1;
  }
}

export const commandRepository = new CommandRepository();
