import type { ProtocolCommand, ProtocolAck } from "../protocol/protocol.types.ts";

export type GatewaySendResult = {
  acknowledged: boolean;
  response?: Record<string, unknown>;
  sentAt: Date;
  completedAt: Date;
};

export interface GatewayTransport {
  readonly gatewayType: string;

  send(command: ProtocolCommand): Promise<GatewaySendResult>;
}

export type GatewayContext = {
  gatewayId: string;
  gatewayName: string;
  gatewayType: string;
  protocolCode: string;
  transport: GatewayTransport;
};
