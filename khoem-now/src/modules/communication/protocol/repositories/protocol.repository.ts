/**
 * KSV — Protocol Repository
 */

import { Protocol, type IProtocol } from '../models/protocol.model';

export class ProtocolRepository {
  async findByProtocolId(protocolId: string): Promise<IProtocol | null> {
    return Protocol.findOne({ protocolId });
  }

  async findByCode(code: string): Promise<IProtocol | null> {
    return Protocol.findOne({ code });
  }

  async listEnabled(): Promise<IProtocol[]> {
    return Protocol.find({ enabled: true }).sort({ name: 1 });
  }

  async listAll(): Promise<IProtocol[]> {
    return Protocol.find().sort({ name: 1 });
  }

  async create(data: Partial<IProtocol>): Promise<IProtocol> {
    return Protocol.create(data);
  }

  async update(
    protocolId: string,
    data: Partial<IProtocol>
  ): Promise<IProtocol | null> {
    return Protocol.findOneAndUpdate(
      { protocolId },
      { $set: data },
      { new: true }
    );
  }

  async delete(protocolId: string): Promise<boolean> {
    const result = await Protocol.deleteOne({ protocolId });
    return result.deletedCount === 1;
  }
}

export const protocolRepository = new ProtocolRepository();
