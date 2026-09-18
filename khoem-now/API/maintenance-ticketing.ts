/**
 * KSV API — Maintenance & Ticketing Domain
 * Location: khoem-now/API/maintenance-ticketing.ts
 *
 * Work orders / field-service tickets for devices and equipment.
 * Connects to device.ts (lifecycle status) and notification.ts
 * (critical-priority auto-alerts).
 */

// ============================================================
// Types
// ============================================================

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "assigned" | "in_progress" | "resolved" | "closed" | "reopened";

export interface MaintenanceTicket {
  ticketId: string;
  deviceId: string;
  organizationId: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string; // accountId of technician
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceSchedule {
  scheduleId: string;
  deviceId: string;
  intervalDays: number;
  lastServicedAt?: string;
  nextDueAt: string;
}

export interface TicketComment {
  commentId: string;
  ticketId: string;
  authorId: string;
  body: string;
  attachedFileIds: string[]; // references file-storage.ts StoredFile
  createdAt: string;
}

export interface TechnicianAssignment {
  assignmentId: string;
  ticketId: string;
  technicianAccountId: string;
  eta?: string;
  assignedAt: string;
}

// ============================================================
// Routes
// ============================================================

export const TICKETING_ROUTES = {
  CREATE: { method: "POST", path: "/api/v1/tickets" },
  LIST: { method: "GET", path: "/api/v1/tickets" },
  GET: { method: "GET", path: "/api/v1/tickets/:id" },
  UPDATE_STATUS: { method: "PUT", path: "/api/v1/tickets/:id/status" },
  ASSIGN: { method: "POST", path: "/api/v1/tickets/:id/assign" },
  ADD_COMMENT: { method: "POST", path: "/api/v1/tickets/:id/comments" },
  ADD_ATTACHMENT: { method: "POST", path: "/api/v1/tickets/:id/attachments" },
  CREATE_SCHEDULE: { method: "POST", path: "/api/v1/maintenance/schedules" },
  SCHEDULES_DUE: { method: "GET", path: "/api/v1/maintenance/schedules/due" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const TICKETING_SECURITY_RULES = [
  "TICKET_REQUIRES_DEVICE_VIEW_PERMISSION_FIRST",
  "CRITICAL_PRIORITY_AUTO_NOTIFIES_MANAGERS", // ties to notification.ts device_alert category
  "OPEN_CRITICAL_TICKET_CAN_RESTRICT_DEVICE_COMMANDS", // safety.ts may block commands while unresolved
  "TECHNICIAN_ASSIGNMENT_REQUIRES_OPERATOR_LEVEL_OR_ABOVE", // not viewer
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum TicketingAuditEvent {
  TICKET_CREATED = "ticket.created",
  STATUS_CHANGED = "ticket.status_changed",
  ASSIGNED = "ticket.assigned",
  RESOLVED = "ticket.resolved",
  REOPENED = "ticket.reopened",
  SCHEDULE_CREATED = "maintenance_schedule.created",
  SCHEDULE_OVERDUE = "maintenance_schedule.overdue",
}
