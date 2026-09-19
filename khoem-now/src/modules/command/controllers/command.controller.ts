/**
 * KSV — Command Controller
 * Location: src/modules/command/controllers/command.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { commandService } from '../services/command.service';

export class CommandController {
  async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orgId = req.user!.organizationId;

      // TODO: ភ្ជាប់ទៅ Authorization Engine + Safety Engine ជាក់ស្តែងនៅទីនេះ
      // (evaluateSafety ពី core/safety/safety.engine.ts) — បច្ចុប្បន្នអនុញ្ញាតគ្រប់ command
      // ដោយស្វ័យប្រវត្តិ, ត្រូវជំនួសមុននឹងដាក់ដំណើរការជាក់ស្តែង។
      const decision: 'ALLOW' | 'WARN' | 'BLOCK' = 'ALLOW';
      const reasons: string[] = ['Default allow — authorization pending'];

      const result = await commandService.create(
        userId,
        orgId,
        req.body,
        decision,
        reasons
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
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
      const orgId = req.user!.organizationId!;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const commands = await commandService.listRecent(orgId, limit);
      res.json({ commands });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
      const result = await commandService.getById(req.params.commandId, orgId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const commandController = new CommandController();
