/**
 * KSV — Safety Repository
 * Location: src/modules/safety/repositories/safety.repository.ts
 */

import {
  SafetyRule,
  SafetyLog,
  type ISafetyRule,
  type ISafetyLog,
} from '../models/safety.model';

export class SafetyRepository {
  // ============ RULES ============

  async findRuleById(ruleId: string): Promise<ISafetyRule | null> {
    return SafetyRule.findOne({ ruleId });
  }

  async listRules(orgId?: string): Promise<ISafetyRule[]> {
    const filter: Record<string, unknown> = {};
    if (orgId) filter.orgId = orgId;
    return SafetyRule.find(filter).sort({ createdAt: -1 });
  }

  async listEnabledRules(orgId?: string): Promise<ISafetyRule[]> {
    const filter: Record<string, unknown> = { enabled: true };
    if (orgId) filter.orgId = orgId;
    return SafetyRule.find(filter);
  }

  async createRule(data: Partial<ISafetyRule>): Promise<ISafetyRule> {
    return SafetyRule.create(data);
  }

  async updateRule(
    ruleId: string,
    data: Partial<ISafetyRule>
  ): Promise<ISafetyRule | null> {
    return SafetyRule.findOneAndUpdate(
      { ruleId },
      { $set: data },
      { new: true }
    );
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const result = await SafetyRule.deleteOne({ ruleId });
    return result.deletedCount === 1;
  }

  // ============ LOGS ============

  async createLog(data: Partial<ISafetyLog>): Promise<ISafetyLog> {
    return SafetyLog.create(data);
  }

  async listLogs(
    deviceId?: string,
    limit = 100
  ): Promise<ISafetyLog[]> {
    const filter: Record<string, unknown> = {};
    if (deviceId) filter.deviceId = deviceId;
    return SafetyLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 500));
  }

  async countLogsByDecision(decision: string): Promise<number> {
    return SafetyLog.countDocuments({ decision });
  }
}

export const safetyRepository = new SafetyRepository();
