/**
 * KSV — Gateway Repository
 */

import { Gateway, type IGateway } from '../models/gateway.model';

export class GatewayRepository {
  async findByGatewayId(gatewayId: string): Promise<IGateway | null> {
    return Gateway.findOne({ gatewayId });
  }

  async listByOrg(orgId: string): Promise<IGateway[]> {
    return Gateway.find({ orgId }).sort({ createdAt: -1 });
  }

  async create(data: Partial<IGateway>): Promise<IGateway> {
    return Gateway.create(data);
  }

  async update(
    gatewayId: string,
    data: Partial<IGateway>
  ): Promise<IGateway | null> {
    return Gateway.findOneAndUpdate(
      { gatewayId },
      { $set: data },
      { new: true }
    );
  }

  async heartbeat(gatewayId: string): Promise<IGateway | null> {
    return Gateway.findOneAndUpdate(
      { gatewayId },
      { $set: { status: 'online', lastHeartbeatAt: new Date() } },
      { new: true }
    );
  }

  async delete(gatewayId: string): Promise<boolean> {
    const result = await Gateway.deleteOne({ gatewayId });
    return result.deletedCount === 1;
  }
}

export const gatewayRepository = new GatewayRepository();
