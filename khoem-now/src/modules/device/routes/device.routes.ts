/**
 * KSV — Device Routes
 * Location: src/modules/device/routes/device.routes.ts
 */

import { Router } from 'express';
import { deviceController } from '../controllers/device.controller';
import { authenticate } from '../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

// Map (ត្រូវដាក់មុន :deviceId ព្រោះបើមិនដូច្នេះ /map នឹងត្រូវចាប់ជា :deviceId)
router.get('/map', (req, res, next) =>
  deviceController.mapDevices(req, res, next)
);

router.post('/', (req, res, next) =>
  deviceController.register(req, res, next)
);

router.get('/', (req, res, next) => deviceController.list(req, res, next));

router.get('/:deviceId', (req, res, next) =>
  deviceController.getById(req, res, next)
);

router.put('/:deviceId', (req, res, next) =>
  deviceController.update(req, res, next)
);

router.delete('/:deviceId', (req, res, next) =>
  deviceController.remove(req, res, next)
);

export const deviceRoutes = router;
export default router;
