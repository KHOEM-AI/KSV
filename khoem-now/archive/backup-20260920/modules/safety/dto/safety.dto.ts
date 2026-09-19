/**
 * KSV — Safety DTO
 * Location: src/modules/safety/dto/safety.dto.ts
 */

import type {
  SafetyDecision,
  SafetySeverity,
} from '../models/safety.model';

export interface CreateSafetyRuleDto {
  name: string;
  description?: string;
  severity?: SafetySeverity;
  condition: Record<string, unknown>;
  decision?: SafetyDecision;
  message?: string;
}

export interface UpdateSafetyRuleDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  severity?: SafetySeverity;
  condition?: Record<string, unknown>;
  decision?: SafetyDecision;
  message?: string;
}

export interface EvaluateSafetyDto {
  deviceId: string;
  commandType: string;
  payload?: Record<string, unknown>;
  commandId?: string;
}

export interface SafetyEvaluationResultDto {
  decision: SafetyDecision;
  severity: SafetySeverity;
  reasons: string[];
  matchedRules: string[];
}

export interface SafetyRuleResponseDto {
  ruleId: string;
  name: string;
  description?: string;
  orgId?: string;
  enabled: boolean;
  severity: SafetySeverity;
  condition: Record<string, unknown>;
  decision: SafetyDecision;
  message?: string;
  createdAt: string;
}

export interface SafetyLogResponseDto {
  logId: string;
  ruleId?: string;
  deviceId: string;
  commandId?: string;
  userId?: string;
  decision: SafetyDecision;
  severity: SafetySeverity;
  reasons: string[];
  createdAt: string;
}
