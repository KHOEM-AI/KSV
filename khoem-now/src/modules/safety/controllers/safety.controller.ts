/**
 * KSV — Safety Controller
 * Location: src/modules/safety/controllers/safety.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { safetyService } from '../services/safety.service';

export class SafetyController {
  // ============ RULES ============

  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.createRule(
        (req.user!.organizationId as string),
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async listRules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.listRules((req.user!.organizationId as string));
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.getRuleById(
        (req.params.ruleId as string),
        (req.user!.organizationId as string)
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.updateRule(
        (req.params.ruleId as string),
        (req.user!.organizationId as string),
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async removeRule(req: Request, res: Response, next: NextFunction) {
    try {
      await safetyService.deleteRule(
        (req.params.ruleId as string),
        (req.user!.organizationId as string)
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // ============ EVALUATION ============

  async evaluate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.evaluate(
        req.body,
        req.user!.id,
        (req.user!.organizationId as string)
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ============ LOGS ============

  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.query.deviceId as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const result = await safetyService.listLogs(
        (req.user!.organizationId as string),
        deviceId,
        limit
      );
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async statistics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safetyService.getStatistics(
        (req.user!.organizationId as string)
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const safetyController = new SafetyController();
