import type { ProtocolCommand, ProtocolAck } from "../protocol/protocol.types.ts";

export type DispatchRequest = {
  deviceId: string;
  organizationId: string;
  commandId: string;
  command: ProtocolCommand;
};

export type DispatchResult =
  | {
      status: "success";
      ack: ProtocolAck;
    }
  | {
      status: "failed";
      code: string;
      message: string;
    }
  | {
      status: "pending";
      message: string;
    };

export interface GatewayDispatcher {
  dispatch(request: DispatchRequest): Promise<DispatchResult>;
}
