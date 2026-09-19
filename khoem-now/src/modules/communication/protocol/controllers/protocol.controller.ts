/**
 * KSV — Protocol Controller
 */

import type { Request, Response, NextFunction } from 'express';
import { protocolService } from '../services/protocol.service';

export class ProtocolController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await protocolService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const includeDisabled = req.query.all === 'true';
      const result = includeDisabled
        ? await protocolService.listAll()
        : await protocolService.listEnabled();
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await protocolService.getById(req.params.protocolId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await protocolService.update(
        req.params.protocolId,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await protocolService.delete(req.params.protocolId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const protocolController = new ProtocolController();
