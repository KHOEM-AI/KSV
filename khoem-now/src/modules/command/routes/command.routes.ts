/**
 * KSV — Command Routes
 * Location: src/modules/command/routes/command.routes.ts
 */

import { Router } from 'express';
import { commandController } from '../controllers/command.controller';
import { authenticate } from '../../../core/auth/auth.middleware';
import { requirePermission } from '../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

// ត្រូវដាក់ /recent មុន /:commandId
router.get('/recent', requirePermission('device:read'), (req, res, next) =>
  commandController.listRecent(req, res, next)
);

router.post('/dispatch', requirePermission('device:command'), (req, res, next) =>
  commandController.dispatch(req, res, next)
);

router.get('/', requirePermission('device:read'), (req, res, next) =>
  commandController.list(req, res, next)
);

router.get('/:commandId', requirePermission('device:read'), (req, res, next) =>
  commandController.getById(req, res, next)
);

export const commandRoutes = router;
export default router;
