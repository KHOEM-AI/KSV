/**
 * KSV — Protocol Routes
 */

import { Router } from 'express';
import { protocolController } from '../controllers/protocol.controller';
import { authenticate } from '../../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) =>
  protocolController.create(req, res, next)
);

router.get('/', (req, res, next) =>
  protocolController.list(req, res, next)
);

router.get('/:protocolId', (req, res, next) =>
  protocolController.getById(req, res, next)
);

router.put('/:protocolId', (req, res, next) =>
  protocolController.update(req, res, next)
);

router.delete('/:protocolId', (req, res, next) =>
  protocolController.remove(req, res, next)
);

export const protocolRoutes = router;
export default router;
