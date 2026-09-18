/**
 * KSV — Identity Routes
 * Location: src/modules/identity/routes/identity.routes.ts
 */

import { Router } from 'express';
import { identityController } from '../controllers/identity.controller';
import { authenticate } from '../../../core/auth/auth.middleware';

const router = Router();

// Public
router.post('/register', (req, res, next) =>
  identityController.register(req, res, next)
);

router.post('/login', (req, res, next) =>
  identityController.login(req, res, next)
);

// Protected
router.get('/me', authenticate, (req, res, next) =>
  identityController.getProfile(req, res, next)
);

router.put('/me', authenticate, (req, res, next) =>
  identityController.updateProfile(req, res, next)
);

router.delete('/me', authenticate, (req, res, next) =>
  identityController.deleteAccount(req, res, next)
);

export default router;
