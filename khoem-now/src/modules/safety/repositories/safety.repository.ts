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

  async findRuleById(
    ruleId: string,
    orgId: string
  ): Promise<ISafetyRule | null> {
    return SafetyRule.findOne({ ruleId, orgId });
  }

  async listRules(orgId: string): Promise<ISafetyRule[]> {
    return SafetyRule.find({ orgId }).sort({ createdAt: -1 });
  }

  async listEnabledRules(orgId: string): Promise<ISafetyRule[]> {
    return SafetyRule.find({ enabled: true, orgId });
  }

  async createRule(data: Partial<ISafetyRule>): Promise<ISafetyRule> {
    return SafetyRule.create(data);
  }

  async updateRule(
    ruleId: string,
    orgId: string,
    data: Partial<ISafetyRule>
  ): Promise<ISafetyRule | null> {
    return SafetyRule.findOneAndUpdate(
      { ruleId, orgId },
      { $set: data },
      { new: true }
    );
  }

  async deleteRule(ruleId: string, orgId: string): Promise<boolean> {
    const result = await SafetyRule.deleteOne({ ruleId, orgId });
    return result.deletedCount === 1;
  }

  // ============ LOGS ============

  async createLog(data: Partial<ISafetyLog>): Promise<ISafetyLog> {
    return SafetyLog.create(data);
  }

  async listLogs(
    orgId: string,
    deviceId?: string,
    limit = 100
  ): Promise<ISafetyLog[]> {
    const filter: Record<string, unknown> = { orgId };
    if (deviceId) filter.deviceId = deviceId;
    return SafetyLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 500));
  }

  async countLogsByDecision(orgId: string, decision: string): Promise<number> {
    return SafetyLog.countDocuments({ orgId, decision });
  }
}

export const safetyRepository = new SafetyRepository();
