/**
 * KSV — Protocol Routes
 */

import { Router } from 'express';
import { protocolController } from '../controllers/protocol.controller';
import { authenticate } from '../../../../core/auth/auth.middleware';
import {
  requirePermission,
  requireMinRole,
} from '../../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

// Protocol Registry ជា global (ប៉ះពាល់គ្រប់ org) ដូច្នេះ write ត្រូវការ SuperAdmin ឡើង
router.post('/', requireMinRole('SuperAdmin'), (req, res, next) =>
  protocolController.create(req, res, next)
);

router.get('/', requirePermission('device:read'), (req, res, next) =>
  protocolController.list(req, res, next)
);

router.get('/:protocolId', requirePermission('device:read'), (req, res, next) =>
  protocolController.getById(req, res, next)
);

router.put('/:protocolId', requireMinRole('SuperAdmin'), (req, res, next) =>
  protocolController.update(req, res, next)
);

router.delete('/:protocolId', requireMinRole('SuperAdmin'), (req, res, next) =>
  protocolController.remove(req, res, next)
);

export const protocolRoutes = router;
export default router;
