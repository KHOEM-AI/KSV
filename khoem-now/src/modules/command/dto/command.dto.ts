/**
 * KSV — Command DTO
 * Location: src/modules/command/dto/command.dto.ts
 */

import type {
  CommandStatus,
  CommandDecision,
} from '../models/command.model';

export interface DispatchCommandDto {
  deviceId: string;
  type: string;
  payload?: Record<string, unknown>;
}

export interface CommandResponseDto {
  commandId: string;
  deviceId: string;
  issuedByUserId: string;
  type: string;
  payload?: Record<string, unknown>;
  status: CommandStatus;
  decision: CommandDecision;
  reasons: string[];
  response?: Record<string, unknown>;
  dispatchedAt?: string;
  acknowledgedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CommandListQueryDto {
  deviceId?: string;
  status?: CommandStatus;
  issuedByUserId?: string;
  orgId?: string;
  limit?: number;
  offset?: number;
}
