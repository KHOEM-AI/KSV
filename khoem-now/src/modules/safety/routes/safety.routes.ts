/**
 * KSV — Safety Routes
 * Location: src/modules/safety/routes/safety.routes.ts
 */

import { Router } from 'express';
import { safetyController } from '../controllers/safety.controller';
import { authenticate } from '../../../core/auth/auth.middleware';
import { requirePermission } from '../../../core/auth/rbac.policy';

const router = Router();

router.use(authenticate);

// Evaluate (ត្រូវដាក់មុន /rules/:ruleId)
router.post('/evaluate', requirePermission('device:command'), (req, res, next) =>
  safetyController.evaluate(req, res, next)
);

// Logs
router.get('/logs', requirePermission('audit:read'), (req, res, next) =>
  safetyController.listLogs(req, res, next)
);

router.get('/statistics', requirePermission('audit:read'), (req, res, next) =>
  safetyController.statistics(req, res, next)
);

// Rules
router.post('/rules', requirePermission('org:manage'), (req, res, next) =>
  safetyController.createRule(req, res, next)
);

router.get('/rules', requirePermission('org:read'), (req, res, next) =>
  safetyController.listRules(req, res, next)
);

router.get('/rules/:ruleId', requirePermission('org:read'), (req, res, next) =>
  safetyController.getRuleById(req, res, next)
);

router.put('/rules/:ruleId', requirePermission('org:manage'), (req, res, next) =>
  safetyController.updateRule(req, res, next)
);

router.delete('/rules/:ruleId', requirePermission('org:manage'), (req, res, next) =>
  safetyController.removeRule(req, res, next)
);

export const safetyRoutes = router;
export default router;
