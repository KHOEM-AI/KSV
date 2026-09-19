/**
 * KSV — Discovery Controller
 * Location: src/modules/discovery/controllers/discovery.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { discoveryService } from '../services/discovery.service';

export class DiscoveryController {
  async announce(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discoveryService.announce(
        req.user!.id,
        req.user!.organizationId,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discoveryService.list(req.user!.organizationId, {
        status: req.query.status as any,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discoveryService.getById(
        req.params.discoveryId,
        req.user!.organizationId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async ignore(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discoveryService.ignore(
        req.params.discoveryId,
        req.user!.organizationId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async block(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discoveryService.block(
        req.params.discoveryId,
        req.user!.organizationId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await discoveryService.remove(
        req.params.discoveryId,
        req.user!.organizationId
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const discoveryController = new DiscoveryController();
