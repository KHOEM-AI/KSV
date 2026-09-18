/**
 * KSV — Organization Routes
 * Location: src/modules/organization/routes/organization.routes.ts
 */

import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { authenticate } from '../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) =>
  organizationController.create(req, res, next)
);

router.get('/mine', (req, res, next) =>
  organizationController.listMine(req, res, next)
);

router.get('/:orgId', (req, res, next) =>
  organizationController.getById(req, res, next)
);

router.put('/:orgId', (req, res, next) =>
  organizationController.update(req, res, next)
);

router.delete('/:orgId', (req, res, next) =>
  organizationController.remove(req, res, next)
);

// Members
router.post('/:orgId/members', (req, res, next) =>
  organizationController.addMember(req, res, next)
);

router.delete('/:orgId/members/:userId', (req, res, next) =>
  organizationController.removeMember(req, res, next)
);

router.put('/:orgId/members/:userId/role', (req, res, next) =>
  organizationController.updateMemberRole(req, res, next)
);

export const organizationRoutes = router;
export default router;
