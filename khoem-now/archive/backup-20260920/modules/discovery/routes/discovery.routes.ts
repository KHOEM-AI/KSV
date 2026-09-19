/**
 * KSV — Discovery Routes
 * Location: src/modules/discovery/routes/discovery.routes.ts
 */

import { Router } from 'express';
import { discoveryController } from '../controllers/discovery.controller';
import { authenticate } from '../../../core/auth/auth.middleware';
import { requirePermission } from '../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

router.post('/announce', requirePermission('device:pair'), (req, res, next) =>
  discoveryController.announce(req, res, next)
);

router.get('/', requirePermission('device:read'), (req, res, next) =>
  discoveryController.list(req, res, next)
);

router.get('/:discoveryId', requirePermission('device:read'), (req, res, next) =>
  discoveryController.getById(req, res, next)
);

router.post(
  '/:discoveryId/ignore',
  requirePermission('device:manage'),
  (req, res, next) => discoveryController.ignore(req, res, next)
);

router.post(
  '/:discoveryId/block',
  requirePermission('device:manage'),
  (req, res, next) => discoveryController.block(req, res, next)
);

router.delete(
  '/:discoveryId',
  requirePermission('device:manage'),
  (req, res, next) => discoveryController.remove(req, res, next)
);

export const discoveryRoutes = router;
export default router;
