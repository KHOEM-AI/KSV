/**
 * KSV — Command Routes (REAL IMPLEMENTATION, not a type-only spec file)
 * Location: khoem-now/src/modules/command/command.routes.ts
 *
 * This is the file that turns ControlsView.tsx buttons from decorative
 * mockups into real device commands. It wires together every security
 * layer already built in src/core/:
 *
 *   Button click
 *     -> POST /api/v1/devices/:deviceId/commands
 *     -> authenticate            (core/auth/auth.middleware.ts)
 *     -> requirePermission       (core/auth/rbac.policy.ts)
 *     -> deviceCommandRateLimiter (core/security/rate-limiter.ts)
 *     -> evaluateSafety          (core/safety/safety.engine.ts)
 *     -> Command.create()        (infrastructure/database/models.ts)
 *     -> auditDeviceCommand()    (core/security/audit.log.ts)
 *     -> JSON response to the UI
 */

import { Router, Request, Response } from "express";
import { authenticate } from "../../core/auth/auth.middleware";
import { requirePermission } from "../../core/auth/rbac.policy";
import { deviceCommandRateLimiter } from "../../core/security/rate-limiter";
import { evaluateSafety } from "../../core/safety/safety.engine";
import { auditDeviceCommand } from "../../core/security/audit.log";
import { Command, Device } from "../../infrastructure/database/models";

export const commandRouter = Router();

// ============================================================
// POST /api/v1/devices/:deviceId/commands
// Dispatch a command to a device — the endpoint every control card
// (Lock, Open, Reset, toggle, slider) in ControlsView.tsx should call.
// ============================================================
commandRouter.post(
  "/devices/:deviceId/commands",
  authenticate,
  requirePermission("device:command"),
  deviceCommandRateLimiter,
  async (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const { type: commandType, payload, signals } = req.body ?? {};

    if (!commandType || typeof commandType !== "string") {
      res.status(400).json({ error: "INVALID_REQUEST", message: "commandType is required." });
      return;
    }

    // 1. Load the device — need its type + org to run the safety check
    // and to make sure it actually exists before creating a command.
    const device = await Device.findById(deviceId).lean();
    if (!device) {
      res.status(404).json({ error: "DEVICE_NOT_FOUND" });
      return;
    }

    // 2. Safety check — separate from and after the RBAC permission
    // check above. An authorized user can still be blocked here.
    const safetyResult = await evaluateSafety({
      deviceId,
      deviceType: device.type,
      organizationId: String(device.organizationId),
      commandType,
      payload,
      signals, // caller (frontend/gateway) supplies current sensor/geo signals
    });

    if (safetyResult.decision === "BLOCKED") {
      await auditDeviceCommand(
        req.user!.id,
        deviceId,
        commandType,
        "BLOCKED",
        { ip: req.ip, reason: safetyResult.reason }
      );

      res.status(423).json({
        error: "SAFETY_BLOCKED",
        message: safetyResult.reason,
        rule: safetyResult.ruleName,
      });
      return;
    }

    // 3. Create the command record (status starts pending, then we
    // simulate/forward execution — real device dispatch happens via
    // the Gateway/Protocol layer, which is out of scope for this file).
    let command;
    try {
      command = await Command.create({
        deviceId,
        userId: req.user!.id,
        type: commandType,
        payload,
        status: "pending",
        sentAt: new Date(),
      });
    } catch (err) {
      await auditDeviceCommand(req.user!.id, deviceId, commandType, "FAILURE", {
        ip: req.ip,
        reason: "Database error creating command",
      });
      res.status(500).json({ error: "COMMAND_CREATE_FAILED" });
      return;
    }

    // 4. Audit the successful dispatch (result reflects "accepted for
    // execution" — actual device ack updates status separately via the
    // gateway callback route, not shown in this file).
    await auditDeviceCommand(req.user!.id, deviceId, commandType, "SUCCESS", {
      ip: req.ip,
    });

    res.status(201).json({
      commandId: command._id,
      deviceId,
      type: commandType,
      status: "pending",
    });
  }
);

// ============================================================
// GET /api/v1/devices/:deviceId/commands
// Command history for a device — powers the "Live Control Activity"
// feed seen on the Controls page.
// ============================================================
commandRouter.get(
  "/devices/:deviceId/commands",
  authenticate,
  requirePermission("device:read"),
  async (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const commands = await Command.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ deviceId, commands });
  }
);

// ============================================================
// GET /api/v1/commands/:id
// Single command status lookup (for polling after dispatch).
// ============================================================
commandRouter.get(
  "/commands/:id",
  authenticate,
  requirePermission("device:read"),
  async (req: Request, res: Response) => {
    const command = await Command.findById(req.params.id).lean();
    if (!command) {
      res.status(404).json({ error: "COMMAND_NOT_FOUND" });
      return;
    }
    res.json(command);
  }
);
