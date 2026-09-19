/**
 * KSV — Safety Routes
 * Location: src/modules/safety/routes/safety.routes.ts
 */

import { Router } from 'express';
import { safetyController } from '../controllers/safety.controller';
import { authenticate } from '../../../core/auth/auth.middleware';

const router = Router();

router.use(authenticate);

// Evaluate (ត្រូវដាក់មុន /rules/:ruleId)
router.post('/evaluate', (req, res, next) =>
  safetyController.evaluate(req, res, next)
);

// Logs
router.get('/logs', (req, res, next) =>
  safetyController.listLogs(req, res, next)
);

router.get('/statistics', (req, res, next) =>
  safetyController.statistics(req, res, next)
);

// Rules
router.post('/rules', (req, res, next) =>
  safetyController.createRule(req, res, next)
);

router.get('/rules', (req, res, next) =>
  safetyController.listRules(req, res, next)
);

router.get('/rules/:ruleId', (req, res, next) =>
  safetyController.getRuleById(req, res, next)
);

router.put('/rules/:ruleId', (req, res, next) =>
  safetyController.updateRule(req, res, next)
);

router.delete('/rules/:ruleId', (req, res, next) =>
  safetyController.removeRule(req, res, next)
);

export const safetyRoutes = router;
export default router;
