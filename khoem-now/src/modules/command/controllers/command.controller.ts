/**
 * KSV — Command Controller
 * Location: src/modules/command/controllers/command.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { commandService } from '../services/command.service';
import { deviceRepository } from '../../device/repositories/device.repository';
import { evaluateSafety } from '../../../core/safety/safety.engine';

export class CommandController {
  async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orgId = (req.user!.organizationId as string);

      if (!orgId) {
        res.status(400).json({ error: 'NO_ORGANIZATION', message: 'User has no organizationId.' });
        return;
      }

      const dto = req.body as { deviceId: string; type: string; payload?: Record<string, unknown>; signals?: Record<string, unknown> };

      // Device must exist and belong to this user's organization —
      // also gives us deviceType, required by the Safety Engine.
      const device = await deviceRepository.findByDeviceIdAndOrg(dto.deviceId, orgId);
      if (!device) {
        res.status(404).json({ error: 'DEVICE_NOT_FOUND' });
        return;
      }

      const safetyResult = await evaluateSafety({
        deviceId: dto.deviceId,
        deviceType: device.type,
        organizationId: orgId,
        commandType: dto.type,
        payload: dto.payload,
        signals: dto.signals,
      });

      const decision: 'ALLOW' | 'WARN' | 'BLOCK' =
        safetyResult.decision === 'BLOCKED' ? 'BLOCK' : 'ALLOW';
      const reasons: string[] = safetyResult.reason
        ? [safetyResult.reason]
        : ['Allowed — no safety rule triggered'];

      const result = await commandService.create(
        userId,
        orgId,
        dto,
        decision,
        reasons
      );

      if (decision === 'BLOCK') {
        res.status(423).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req.user!.organizationId as string)!;
      const result = await commandService.list(orgId, {
        deviceId: req.query.deviceId as string,
        status: req.query.status as any,
        issuedByUserId: req.query.issuedByUserId as string,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async listRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req.user!.organizationId as string)!;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const commands = await commandService.listRecent(orgId, limit);
      res.json({ commands });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req.user!.organizationId as string)!;
      const result = await commandService.getById((req.params.commandId as string), orgId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const commandController = new CommandController();
