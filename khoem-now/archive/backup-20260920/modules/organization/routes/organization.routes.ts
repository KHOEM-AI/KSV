/**
 * KSV — Organization Routes
 * Location: src/modules/organization/routes/organization.routes.ts
 */

import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { authenticate } from '../../../core/auth/auth.middleware';
import { requirePermission } from '../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

// បង្កើត org ដំបូង: user ថ្មីគ្មាន org:manage ដូច្នេះមានតែ authenticate
router.post('/', (req, res, next) =>
  organizationController.create(req, res, next)
);

router.get('/mine', requirePermission('org:read'), (req, res, next) =>
  organizationController.listMine(req, res, next)
);

router.get('/:orgId', requirePermission('org:read'), (req, res, next) =>
  organizationController.getById(req, res, next)
);

router.put('/:orgId', requirePermission('org:manage'), (req, res, next) =>
  organizationController.update(req, res, next)
);

router.delete('/:orgId', requirePermission('org:manage'), (req, res, next) =>
  organizationController.remove(req, res, next)
);

// Members
router.post(
  '/:orgId/members',
  requirePermission('user:manage'),
  (req, res, next) => organizationController.addMember(req, res, next)
);

router.delete(
  '/:orgId/members/:userId',
  requirePermission('user:manage'),
  (req, res, next) => organizationController.removeMember(req, res, next)
);

router.put(
  '/:orgId/members/:userId/role',
  requirePermission('user:manage'),
  (req, res, next) => organizationController.updateMemberRole(req, res, next)
);

export const organizationRoutes = router;
export default router;
