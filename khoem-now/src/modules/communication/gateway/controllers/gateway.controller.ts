/**
 * KSV — Gateway Controller
 */

import type { Request, Response, NextFunction } from 'express';
import { gatewayService } from '../services/gateway.service';

export class GatewayController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.create(
        (req.user!.organizationId as string),
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.listByOrg((req.user!.organizationId as string));
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.getById(
        (req.params.gatewayId as string),
        (req.user!.organizationId as string)
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gatewayService.update(
        (req.params.gatewayId as string),
        (req.user!.organizationId as string),
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      await gatewayService.heartbeat(
        (req.params.gatewayId as string),
        (req.user!.organizationId as string)
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await gatewayService.delete(
        (req.params.gatewayId as string),
        (req.user!.organizationId as string)
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const gatewayController = new GatewayController();
