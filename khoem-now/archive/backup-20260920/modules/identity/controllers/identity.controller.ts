/**
 * KSV — Identity Controller
 * Location: src/modules/identity/controllers/identity.controller.ts
 * 
 * ទទួល HTTP Request និងឆ្លើយតប
 */

import type { Request, Response, NextFunction } from 'express';
import { identityService } from '../services/identity.service';

export class IdentityController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await identityService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await identityService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await identityService.getProfile(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await identityService.updateProfile(userId, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await identityService.deleteAccount(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const identityController = new IdentityController();
