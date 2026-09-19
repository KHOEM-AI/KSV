/**
 * KSV — Command Routes
 * Location: src/modules/command/routes/command.routes.ts
 */

import { Router } from 'express';
import { commandController } from '../controllers/command.controller';
import { authenticate } from '../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

// ត្រូវដាក់ /recent មុន /:commandId
router.get('/recent', (req, res, next) =>
  commandController.listRecent(req, res, next)
);

router.post('/dispatch', (req, res, next) =>
  commandController.dispatch(req, res, next)
);

router.get('/', (req, res, next) =>
  commandController.list(req, res, next)
);

router.get('/:commandId', (req, res, next) =>
  commandController.getById(req, res, next)
);

export const commandRoutes = router;
export default router;
