/**
 * KSV — Device Routes
 * Location: src/modules/device/routes/device.routes.ts
 */

import { Router } from 'express';
import { deviceController } from '../controllers/device.controller';
import { authenticate } from '../../../core/auth/auth.middleware';
import { requirePermission } from '../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

// Map (ត្រូវដាក់មុន :deviceId ព្រោះបើមិនដូច្នេះ /map នឹងត្រូវចាប់ជា :deviceId)
router.get('/map', requirePermission('device:read'), (req, res, next) =>
  deviceController.mapDevices(req, res, next)
);

router.post('/', requirePermission('device:pair'), (req, res, next) =>
  deviceController.register(req, res, next)
);

router.get('/', requirePermission('device:read'), (req, res, next) =>
  deviceController.list(req, res, next)
);

router.get('/:deviceId', requirePermission('device:read'), (req, res, next) =>
  deviceController.getById(req, res, next)
);

router.put('/:deviceId', requirePermission('device:manage'), (req, res, next) =>
  deviceController.update(req, res, next)
);

router.delete('/:deviceId', requirePermission('device:manage'), (req, res, next) =>
  deviceController.remove(req, res, next)
);

export const deviceRoutes = router;
export default router;
