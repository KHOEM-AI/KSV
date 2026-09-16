export type ProtocolCommand = {
  deviceId: string;
  deviceCode: string;
  deviceType: string;
  commandType: string;
  payload?: Record<string, unknown>;
};

export type ProtocolAck = {
  acknowledged: boolean;
  response?: Record<string, unknown>;
  receivedAt: Date;
};

export interface ProtocolAdapter {
  readonly code: string;

  send(command: ProtocolCommand): Promise<ProtocolAck>;
}
