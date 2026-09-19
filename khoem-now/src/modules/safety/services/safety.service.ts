/**
 * KSV — Safety Service
 * Location: src/modules/safety/services/safety.service.ts
 *
 * Business Logic សម្រាប់ Safety Engine
 * FLOW: Command → Evaluate Rules → ALLOW / WARN / BLOCK
 */

import crypto from 'node:crypto';
import { safetyRepository } from '../repositories/safety.repository';
import type {
  CreateSafetyRuleDto,
  UpdateSafetyRuleDto,
  EvaluateSafetyDto,
  SafetyEvaluationResultDto,
  SafetyRuleResponseDto,
  SafetyLogResponseDto,
} from '../dto/safety.dto';

export class SafetyService {
  private toRuleResponse(r: any): SafetyRuleResponseDto {
    return {
      ruleId: r.ruleId,
      name: r.name,
      description: r.description,
      orgId: r.orgId,
      enabled: r.enabled,
      severity: r.severity,
      condition: r.condition,
      decision: r.decision,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private toLogResponse(l: any): SafetyLogResponseDto {
    return {
      logId: l.logId,
      ruleId: l.ruleId,
      deviceId: l.deviceId,
      commandId: l.commandId,
      userId: l.userId,
      decision: l.decision,
      severity: l.severity,
      reasons: l.reasons ?? [],
      createdAt: l.createdAt.toISOString(),
    };
  }

  // ============ RULES ============

  async createRule(dto: CreateSafetyRuleDto): Promise<SafetyRuleResponseDto> {
    const ruleId = `SAF-${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    const rule = await safetyRepository.createRule({
      ruleId,
      name: dto.name,
      description: dto.description,
      orgId: dto.orgId,
      severity: dto.severity || 'medium',
      condition: dto.condition,
      decision: dto.decision || 'WARN',
      message: dto.message,
      enabled: true,
    });

    return this.toRuleResponse(rule);
  }

  async listRules(orgId?: string): Promise<SafetyRuleResponseDto[]> {
    const list = await safetyRepository.listRules(orgId);
    return list.map((r) => this.toRuleResponse(r));
  }

  async getRuleById(ruleId: string): Promise<SafetyRuleResponseDto> {
    const r = await safetyRepository.findRuleById(ruleId);
    if (!r) throw new Error('Safety rule not found');
    return this.toRuleResponse(r);
  }

  async updateRule(
    ruleId: string,
    dto: UpdateSafetyRuleDto
  ): Promise<SafetyRuleResponseDto> {
    const r = await safetyRepository.updateRule(ruleId, dto as any);
    if (!r) throw new Error('Safety rule not found');
    return this.toRuleResponse(r);
  }

  async deleteRule(ruleId: string): Promise<void> {
    const ok = await safetyRepository.deleteRule(ruleId);
    if (!ok) throw new Error('Safety rule not found');
  }

  // ============ EVALUATION ============

  /**
   * វាយតម្លៃសុវត្ថិភាពសម្រាប់ Command
   * Logic: បើមាន Rule BLOCK ត្រូវ → BLOCK
   *        បើមាន Rule WARN → WARN
   *        បើគ្មាន → ALLOW
   */
  async evaluate(
    dto: EvaluateSafetyDto,
    userId?: string,
    orgId?: string
  ): Promise<SafetyEvaluationResultDto> {
    const rules = await safetyRepository.listEnabledRules(orgId);

    const matchedRules: string[] = [];
    const reasons: string[] = [];
    let finalDecision: 'ALLOW' | 'WARN' | 'BLOCK' = 'ALLOW';
    let highestSeverity: 'info' | 'low' | 'medium' | 'high' | 'critical' =
      'info';

    const severityRank = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

    for (const rule of rules) {
      const matched = this.matchesCondition(rule.condition, dto);
      if (!matched) continue;

      matchedRules.push(rule.ruleId);
      if (rule.message) reasons.push(rule.message);

      if (rule.decision === 'BLOCK') {
        finalDecision = 'BLOCK';
      } else if (rule.decision === 'WARN' && finalDecision !== 'BLOCK') {
        finalDecision = 'WARN';
      }

      if (severityRank[rule.severity] > severityRank[highestSeverity]) {
        highestSeverity = rule.severity;
      }
    }

    if (reasons.length === 0) {
      reasons.push('No safety rule matched — default allow');
    }

    // កត់ត្រា Log
    const logId = `SLOG-${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    await safetyRepository.createLog({
      logId,
      ruleId: matchedRules[0],
      deviceId: dto.deviceId,
      commandId: dto.commandId,
      userId,
      decision: finalDecision,
      severity: highestSeverity,
      reasons,
      metadata: { commandType: dto.commandType },
    });

    return {
      decision: finalDecision,
      severity: highestSeverity,
      reasons,
      matchedRules,
    };
  }

  /**
   * ត្រួតពិនិត្យថាតើ Condition ត្រូវនឹង Command ឬអត់
   * Condition គឺ JSON ដូចជា:
   *   { "commandType": "ESTOP_ENGAGE" }
   *   { "commandType": ["LOCK", "UNLOCK"], "deviceId": "DEV-04821" }
   */
  private matchesCondition(
    condition: Record<string, unknown>,
    dto: EvaluateSafetyDto
  ): boolean {
    for (const [key, value] of Object.entries(condition)) {
      const actual = (dto as any)[key];
      if (Array.isArray(value)) {
        if (!value.includes(actual)) return false;
      } else if (value !== actual) {
        return false;
      }
    }
    return true;
  }

  // ============ LOGS ============

  async listLogs(
    deviceId?: string,
    limit = 100
  ): Promise<SafetyLogResponseDto[]> {
    const logs = await safetyRepository.listLogs(deviceId, limit);
    return logs.map((l) => this.toLogResponse(l));
  }

  async getStatistics(): Promise<{
    allow: number;
    warn: number;
    block: number;
  }> {
    const [allow, warn, block] = await Promise.all([
      safetyRepository.countLogsByDecision('ALLOW'),
      safetyRepository.countLogsByDecision('WARN'),
      safetyRepository.countLogsByDecision('BLOCK'),
    ]);
    return { allow, warn, block };
  }
}

export const safetyService = new SafetyService();
