/**
 * KSV — Safety Module
 * Location: src/modules/safety/index.ts
 *
 * Export ទាំងអស់ពី Safety Module
 */

export { safetyRoutes } from './routes/safety.routes';
export { default as safetyRouter } from './routes/safety.routes';

export { safetyController } from './controllers/safety.controller';
export { SafetyController } from './controllers/safety.controller';

export { safetyService } from './services/safety.service';
export { SafetyService } from './services/safety.service';

export { safetyRepository } from './repositories/safety.repository';
export { SafetyRepository } from './repositories/safety.repository';

export { SafetyRule, SafetyLog } from './models/safety.model';
export type {
  ISafetyRule,
  ISafetyLog,
  SafetyDecision,
  SafetySeverity,
} from './models/safety.model';

export type {
  CreateSafetyRuleDto,
  UpdateSafetyRuleDto,
  EvaluateSafetyDto,
  SafetyEvaluationResultDto,
  SafetyRuleResponseDto,
  SafetyLogResponseDto,
} from './dto/safety.dto';
