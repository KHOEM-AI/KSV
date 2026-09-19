/**
 * KSV — Organization Controller
 * Location: src/modules/organization/controllers/organization.controller.ts
 */

import type { Request, Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service';

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.create(req.user!.id, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listForUser(req.user!.id);
      res.json({ total: result.length, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getById(
        req.params.orgId,
        req.user!.id
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.update(
        req.params.orgId,
        req.user!.id,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await organizationService.delete(req.params.orgId, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.addMember(
        req.params.orgId,
        req.user!.id,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await organizationService.removeMember(
        req.params.orgId,
        req.user!.id,
        req.params.userId
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateMemberRole(
        req.params.orgId,
        req.user!.id,
        req.params.userId,
        req.body
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const organizationController = new OrganizationController();
