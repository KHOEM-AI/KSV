/**
 * KSV — Gateway Controller
 */

import type { Request, Response, NextFunction } from 'express';
import { gatewayService } from '../services/gateway.service';

export class GatewayController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user?.orgId || req.body.orgId;
      const result = await gatewayService.create(orgId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user?.orgId;
      const result = await gatewayService.listByOrg(orgId);
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.getById(req.params.gatewayId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.update(
        req.params.gatewayId,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      await gatewayService.heartbeat(req.params.gatewayId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await gatewayService.delete(req.params.gatewayId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const gatewayController = new GatewayController();
