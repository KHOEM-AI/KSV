/**
 * KSV — Gateway Routes
 */

import { Router } from 'express';
import { gatewayController } from '../controllers/gateway.controller';
import { authenticate } from '../../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) =>
  gatewayController.create(req, res, next)
);

router.get('/mine', (req, res, next) =>
  gatewayController.listMine(req, res, next)
);

router.get('/:gatewayId', (req, res, next) =>
  gatewayController.getById(req, res, next)
);

router.put('/:gatewayId', (req, res, next) =>
  gatewayController.update(req, res, next)
);

router.post('/:gatewayId/heartbeat', (req, res, next) =>
  gatewayController.heartbeat(req, res, next)
);

router.delete('/:gatewayId', (req, res, next) =>
  gatewayController.remove(req, res, next)
);

export const gatewayRoutes = router;
export default router;
