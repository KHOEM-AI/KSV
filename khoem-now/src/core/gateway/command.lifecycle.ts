import { Command } from "../../infrastructure/database/models.ts";
import type { DispatchResult } from "./gateway.dispatcher.types.ts";

export async function applyDispatchResult(
  commandId: string,
  result: DispatchResult
): Promise<void> {
  if (result.status === "pending") {
    await Command.updateOne(
      { _id: commandId },
      {
        $set: {
          status: "pending",
          response: { message: result.message },
        },
      }
    );
    return;
  }

  if (result.status === "success") {
    await Command.updateOne(
      { _id: commandId },
      {
        $set: {
          status: "success",
          response: result.ack.response ?? {},
          completedAt: result.ack.receivedAt,
        },
      }
    );
    return;
  }

  await Command.updateOne(
    { _id: commandId },
    {
      $set: {
        status: "failed",
        response: {
          code: result.code,
          message: result.message,
        },
        completedAt: new Date(),
      },
    }
  );
}
