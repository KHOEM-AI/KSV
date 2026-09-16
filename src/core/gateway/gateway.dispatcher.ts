import { Device, Gateway, Protocol } from "../../infrastructure/database/models.ts";
import { getProtocolAdapter } from "../protocol/protocol.registry.ts";
import type { ProtocolCommand } from "../protocol/protocol.types.ts";
import type {
  DispatchRequest,
  DispatchResult,
  GatewayDispatcher,
} from "./gateway.dispatcher.types.ts";

export class DefaultGatewayDispatcher implements GatewayDispatcher {
  async dispatch(request: DispatchRequest): Promise<DispatchResult> {
    const { deviceId, organizationId, command } = request;

    const device = await Device.findOne({
      _id: deviceId,
      organizationId,
    }).lean();

    if (!device) {
      return {
        status: "failed",
        code: "DEVICE_NOT_FOUND",
        message: "Device not found.",
      };
    }

    if (!device.gatewayId) {
      return {
        status: "failed",
        code: "GATEWAY_NOT_CONFIGURED",
        message: "Device has no gateway configured.",
      };
    }

    if (!device.protocolId) {
      return {
        status: "failed",
        code: "PROTOCOL_NOT_CONFIGURED",
        message: "Device has no protocol configured.",
      };
    }

    const gateway = await Gateway.findById(device.gatewayId).lean();

    if (!gateway) {
      return {
        status: "failed",
        code: "GATEWAY_NOT_FOUND",
        message: "Configured gateway was not found.",
      };
    }

    if (gateway.status !== "online") {
      return {
        status: "failed",
        code: "GATEWAY_OFFLINE",
        message: `Gateway is ${gateway.status}.`,
      };
    }

    const protocol = await Protocol.findById(device.protocolId).lean();

    if (!protocol) {
      return {
        status: "failed",
        code: "PROTOCOL_NOT_FOUND",
        message: "Configured protocol was not found.",
      };
    }

    const adapter = getProtocolAdapter(protocol.code);

    if (!adapter) {
      return {
        status: "failed",
        code: "PROTOCOL_ADAPTER_UNAVAILABLE",
        message: `No protocol adapter is registered for ${protocol.code}.`,
      };
    }

    const protocolCommand: ProtocolCommand = {
      deviceId,
      deviceCode: device.deviceCode,
      deviceType: device.type,
      commandType: command.commandType,
      payload: command.payload,
    };

    try {
      const ack = await adapter.send(protocolCommand);

      if (!ack.acknowledged) {
        return {
          status: "failed",
          code: "DEVICE_ACK_NOT_RECEIVED",
          message: "Gateway/protocol did not acknowledge the command.",
        };
      }

      return {
        status: "success",
        ack,
      };
    } catch (error) {
      console.error("[GATEWAY] Dispatch failed:", error);

      return {
        status: "failed",
        code: "TRANSPORT_ERROR",
        message: "Physical transport failed.",
      };
    }
  }
}
