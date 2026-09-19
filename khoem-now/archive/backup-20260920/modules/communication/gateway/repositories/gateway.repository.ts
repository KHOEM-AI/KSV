/**
 * KSV — Gateway Repository
 */

import { Gateway, type IGateway } from '../models/gateway.model';

export class GatewayRepository {
  async findByGatewayId(
    gatewayId: string,
    orgId: string
  ): Promise<IGateway | null> {
    return Gateway.findOne({ gatewayId, orgId });
  }

  async listByOrg(orgId: string): Promise<IGateway[]> {
    return Gateway.find({ orgId }).sort({ createdAt: -1 });
  }

  async create(data: Partial<IGateway>): Promise<IGateway> {
    return Gateway.create(data);
  }

  async update(
    gatewayId: string,
    orgId: string,
    data: Partial<IGateway>
  ): Promise<IGateway | null> {
    return Gateway.findOneAndUpdate(
      { gatewayId, orgId },
      { $set: data },
      { new: true }
    );
  }

  async heartbeat(
    gatewayId: string,
    orgId: string
  ): Promise<IGateway | null> {
    return Gateway.findOneAndUpdate(
      { gatewayId, orgId },
      { $set: { status: 'online', lastHeartbeatAt: new Date() } },
      { new: true }
    );
  }

  async delete(gatewayId: string, orgId: string): Promise<boolean> {
    const result = await Gateway.deleteOne({ gatewayId, orgId });
    return result.deletedCount === 1;
  }
}

export const gatewayRepository = new GatewayRepository();
