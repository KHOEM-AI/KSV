// =============================================================
// KSV — Notification API
// Domain: Alerts via App, Email, SMS, Push
// =============================================================

export type NotificationChannel = 'app' | 'email' | 'sms' | 'push';
export type NotificationCategory =
  | 'security_alert'
  | 'login_alert'
  | 'device_alert'
  | 'permission_change'
  | 'device_offline'
  | 'device_online'
  | 'command_failure'
  | 'emergency_alert'
  | 'account_recovery'
  | 'safety_event'
  | 'firmware_update'
  | 'organization_invite'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'read';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVNotification {
  notificationId: string;
  accountId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  channels: NotificationChannel[];
  status: Record<NotificationChannel, NotificationStatus>;
  relatedResourceType?: string;
  relatedResourceId?: string;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  accountId: string;
  categoryPreferences: Record<NotificationCategory, {
    enabled: boolean;
    channels: NotificationChannel[];
  }>;
  quietHours?: {
    enabled: boolean;
    fromTime: string;          // HH:MM
    toTime: string;
    exceptCritical: boolean;   // Critical alerts bypass quiet hours
  };
  language: string;
}

export interface PushDeviceToken {
  tokenId: string;
  accountId: string;
  platform: 'ios' | 'android' | 'web';
  token: string;
  registeredAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface SendNotificationRequest {
  accountId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  channels?: NotificationChannel[];  // If omitted, uses user preferences
  relatedResourceType?: string;
  relatedResourceId?: string;
  actionUrl?: string;
  expiresAt?: string;
}

export interface SendBulkNotificationRequest {
  accountIds: string[];
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  channels?: NotificationChannel[];
}

export interface SendBulkNotificationResponse {
  totalRecipients: number;
  queued: number;
  failed: number;
  batchId: string;
}

export interface ListNotificationsRequest {
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListNotificationsResponse {
  notifications: KSVNotification[];
  unreadCount: number;
  total: number;
}

export interface MarkReadRequest {
  notificationId: string;
}

export interface MarkAllReadRequest {
  category?: NotificationCategory;
}

export interface UpdatePreferencesRequest {
  categoryPreferences?: Partial<NotificationPreferences['categoryPreferences']>;
  quietHours?: NotificationPreferences['quietHours'];
  language?: string;
}

export interface RegisterPushTokenRequest {
  platform: 'ios' | 'android' | 'web';
  token: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const NOTIFICATION_ROUTES = {
  // Sending (internal use by other API domains + admin)
  SEND_NOTIFICATION:       'POST /api/v1/notifications/send',
  SEND_BULK:               'POST /api/v1/notifications/send-bulk',

  // Inbox
  LIST_NOTIFICATIONS:      'GET  /api/v1/notifications',
  GET_NOTIFICATION:        'GET  /api/v1/notifications/:notificationId',
  MARK_READ:               'POST /api/v1/notifications/:notificationId/read',
  MARK_ALL_READ:           'POST /api/v1/notifications/read-all',
  DELETE_NOTIFICATION:     'DELETE /api/v1/notifications/:notificationId',

  // Preferences
  GET_PREFERENCES:         'GET  /api/v1/notifications/preferences',
  UPDATE_PREFERENCES:      'PUT  /api/v1/notifications/preferences',

  // Push tokens
  REGISTER_PUSH_TOKEN:     'POST /api/v1/notifications/push-tokens',
  LIST_PUSH_TOKENS:        'GET  /api/v1/notifications/push-tokens',
  REMOVE_PUSH_TOKEN:       'DELETE /api/v1/notifications/push-tokens/:tokenId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface NotificationAPIHandlers {
  sendNotification(req: SendNotificationRequest): Promise<{ notificationId: string; queued: boolean }>;
  sendBulkNotification(req: SendBulkNotificationRequest): Promise<SendBulkNotificationResponse>;

  listNotifications(accountId: string, req: ListNotificationsRequest): Promise<ListNotificationsResponse>;
  getNotification(notificationId: string, accountId: string): Promise<KSVNotification>;
  markRead(accountId: string, req: MarkReadRequest): Promise<{ success: boolean }>;
  markAllRead(accountId: string, req: MarkAllReadRequest): Promise<{ success: boolean; markedCount: number }>;
  deleteNotification(notificationId: string, accountId: string): Promise<{ success: boolean }>;

  getPreferences(accountId: string): Promise<NotificationPreferences>;
  updatePreferences(accountId: string, req: UpdatePreferencesRequest): Promise<NotificationPreferences>;

  registerPushToken(accountId: string, req: RegisterPushTokenRequest): Promise<PushDeviceToken>;
  listPushTokens(accountId: string): Promise<PushDeviceToken[]>;
  removePushToken(accountId: string, tokenId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Rules
// ---------------------------------------------------------------

export const NOTIFICATION_RULES = {
  /** Critical/emergency alerts always bypass quiet hours and user opt-outs. */
  CRITICAL_ALERTS_ALWAYS_DELIVERED: true,

  /** Security alerts cannot be fully disabled — only channel choice can be limited. */
  SECURITY_ALERTS_CANNOT_BE_FULLY_DISABLED: true,

  /** Notifications expire and are auto-cleaned after this many days if unread. */
  DEFAULT_EXPIRY_DAYS: 90,

  /** Bulk notifications are rate-limited to avoid spamming users. */
  BULK_RATE_LIMIT_PER_MINUTE: 1000,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type NotificationAuditEvent =
  | 'notification.sent'
  | 'notification.delivery_failed'
  | 'notification.read'
  | 'notification.preferences_updated'
  | 'notification.push_token_registered'
  | 'notification.push_token_removed'
  | 'notification.bulk_sent';
