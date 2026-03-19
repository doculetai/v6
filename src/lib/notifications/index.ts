/**
 * Notifications — barrel export.
 */

export { createNotification, createBulkNotifications } from './create-notification';
export { buildNotificationFromEvent, NOTIFICATION_EVENTS } from './event-map';

export type {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  CreateNotificationParams,
} from './create-notification';
