/**
 * KSV — Device Controller
 * Location: src/modules/device/controllers/device.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { deviceService } from '../services/device.service';

export class DeviceController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orgId = req.user!.organizationId;
      if (!orgId) {
        res.status(400).json({ error: 'NO_ORGANIZATION', message: 'User has no organizationId.' });
        return;
      }
      // orgId always comes from the authenticated user — never let the
      // client register a device into an arbitrary organization.
      const { orgId: _ignored, ...body } = req.body ?? {};
      const result = await deviceService.register(userId, { ...body, orgId });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
      const result = await deviceService.list(orgId, {
        status: req.query.status as any,
        category: req.query.category as any,
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
      const orgId = req.user!.organizationId!;
      const result = await deviceService.getById(req.params.deviceId, orgId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
      const result = await deviceService.update(req.params.deviceId, orgId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
      await deviceService.delete(req.params.deviceId, orgId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async mapDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.organizationId!;
      const devices = await deviceService.getMapDevices(orgId);
      res.json({ total: devices.length, devices });
    } catch (err) {
      next(err);
    }
  }
}

export const deviceController = new DeviceController();
