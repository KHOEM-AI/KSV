/**
 * KSV — Device Controller
 * Location: src/modules/device/controllers/device.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service';

export class DeviceController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const result = await deviceService.register(userId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deviceService.list({
        status: req.query.status as any,
        category: req.query.category as any,
        orgId: req.query.orgId as string,
        site: req.query.site as string,
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
      const result = await deviceService.getById(req.params.deviceId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deviceService.update(req.params.deviceId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await deviceService.delete(req.params.deviceId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async mapDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.query.orgId as string | undefined;
      const devices = await deviceService.getMapDevices(orgId);
      res.json({ total: devices.length, devices });
    } catch (err) {
      next(err);
    }
  }
}

export const deviceController = new DeviceController();
