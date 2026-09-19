/**
 * KSV — Gateway Routes
 */

import { Router } from 'express';
import { gatewayController } from '../controllers/gateway.controller';
import { authenticate } from '../../../../core/auth/auth.middleware';
import { requirePermission } from '../../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('device:manage'), (req, res, next) =>
  gatewayController.create(req, res, next)
);

router.get('/mine', requirePermission('device:read'), (req, res, next) =>
  gatewayController.listMine(req, res, next)
);

router.get('/:gatewayId', requirePermission('device:read'), (req, res, next) =>
  gatewayController.getById(req, res, next)
);

router.put('/:gatewayId', requirePermission('device:manage'), (req, res, next) =>
  gatewayController.update(req, res, next)
);

router.post(
  '/:gatewayId/heartbeat',
  requirePermission('device:manage'),
  (req, res, next) => gatewayController.heartbeat(req, res, next)
);

router.delete(
  '/:gatewayId',
  requirePermission('device:manage'),
  (req, res, next) => gatewayController.remove(req, res, next)
);

export const gatewayRoutes = router;
export default router;
