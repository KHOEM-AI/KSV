/**
 * KSV API — AI Orchestration Domain
 * Location: khoem-now/API/ai-orchestration.ts
 *
 * AI is an INTERPRETER only — it never bypasses Authentication,
 * Authorization, or the Safety Engine. Every structured command it
 * produces re-enters the same Command Pipeline as a manually typed
 * command (see command.ts).
 */

// ============================================================
// Types
// ============================================================

export type AIProvider = "internal" | "anthropic" | "openai" | "custom";

export interface AIModelProfile {
  modelId: string;
  provider: AIProvider;
  version: string;
  allowedScopes: string[]; // e.g. ["device:read", "device:command"]
  isEnabled: boolean;
}

export interface AIInterpretationRequest {
  requestId: string;
  accountId: string;
  organizationId: string;
  naturalLanguageInput: string;
  deviceContext?: { deviceId: string; deviceType: string }[];
  sessionId?: string;
}

export interface StructuredCommandDraft {
  deviceId: string;
  commandType: string;
  payload?: Record<string, unknown>;
}

export interface AmbiguityOption {
  label: string;
  structuredCommand: StructuredCommandDraft;
}

export interface AIInterpretationResult {
  requestId: string;
  confidence: number; // 0-1
  structuredCommand?: StructuredCommandDraft;
  requiresClarification: boolean;
  ambiguityOptions?: AmbiguityOption[];
}

export interface AIConversationTurn {
  turnId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

export interface AIConversationSession {
  sessionId: string;
  accountId: string;
  turns: AIConversationTurn[];
  createdAt: string;
  expiresAt: string;
}

// ============================================================
// Routes
// ============================================================

export const AI_ORCHESTRATION_ROUTES = {
  INTERPRET: { method: "POST", path: "/api/v1/ai/interpret" },
  INTERPRET_CONFIRM: { method: "POST", path: "/api/v1/ai/interpret/confirm" },
  GET_SESSION: { method: "GET", path: "/api/v1/ai/sessions/:id" },
  DELETE_SESSION: { method: "DELETE", path: "/api/v1/ai/sessions/:id" },
  LIST_MODELS: { method: "GET", path: "/api/v1/ai/models" },
  TOGGLE_MODEL: { method: "POST", path: "/api/v1/ai/models/:id/enable" },
  GET_USAGE: { method: "GET", path: "/api/v1/ai/usage" },
  SUBMIT_FEEDBACK: { method: "POST", path: "/api/v1/ai/feedback" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const AI_ORCHESTRATION_SECURITY_RULES = [
  "AI_OUTPUT_MUST_ENTER_COMMAND_PIPELINE", // authenticate -> authorize -> safety -> execute -> audit
  "AI_CANNOT_ELEVATE_CALLER_PERMISSIONS",
  "HIGH_RISK_COMMANDS_REQUIRE_HUMAN_CONFIRMATION",
  "AMBIGUOUS_INPUT_MUST_ASK_NOT_GUESS",
  "CONVERSATION_DATA_FOLLOWS_PRIVACY_POLICY",
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum AIAuditEvent {
  INTERPRETATION_REQUESTED = "ai.interpretation.requested",
  INTERPRETATION_SUCCEEDED = "ai.interpretation.succeeded",
  INTERPRETATION_AMBIGUOUS = "ai.interpretation.ambiguous",
  INTERPRETATION_CONFIRMED = "ai.interpretation.confirmed",
  INTERPRETATION_REJECTED = "ai.interpretation.rejected",
  SESSION_DELETED = "ai.session.deleted",
  MODEL_TOGGLED = "ai.model.toggled",
}
