/**
 * Server-side notification creation utility.
 * Call from tRPC mutations, webhooks, or cron jobs to create notifications.
 */

import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { notificationPreferences, notifications } from '@/db/schema';

/** Supported notification types. */
export type NotificationType =
  | 'invite'
  | 'invite_accepted'
  | 'invite_rejected'
  | 'doc_approved'
  | 'doc_rejected'
  | 'doc_more_info'
  | 'cert_issued'
  | 'disbursement_success'
  | 'disbursement_failed'
  | 'kyc_reminder'
  | 'system';

/** Notification category for preference filtering. */
export type NotificationCategory =
  | 'security'
  | 'verification'
  | 'payments'
  | 'messaging'
  | 'sponsorship'
  | 'documents'
  | 'system'
  | 'marketing';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body?: string;
  /** Deep link path within the dashboard (e.g., /dashboard/student/proof). */
  link?: string;
  priority?: NotificationPriority;
  meta?: Record<string, unknown>;
};

/**
 * Create an in-app notification, respecting user preferences.
 * Returns the notification ID if created, or null if suppressed by preferences.
 */
export async function createNotification(
  db: DrizzleDB,
  params: CreateNotificationParams,
): Promise<string | null> {
  // Check if user has disabled in_app notifications for this category
  const preference = await db.query.notificationPreferences.findFirst({
    where: (t, { and: a, eq: e }) =>
      a(
        e(t.userId, params.userId),
        e(t.channel, 'in_app'),
        e(t.category, params.category),
      ),
    columns: { enabled: true },
  });

  // If preference explicitly disabled, skip. Default is enabled.
  if (preference && !preference.enabled) {
    return null;
  }

  // Also check global in_app preference (category = null)
  const globalPref = await db.query.notificationPreferences.findFirst({
    where: (t, { and: a, eq: e, isNull: n }) =>
      a(e(t.userId, params.userId), e(t.channel, 'in_app'), n(t.category)),
    columns: { enabled: true },
  });

  if (globalPref && !globalPref.enabled) {
    return null;
  }

  const [row] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      category: params.category,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      priority: params.priority ?? 'normal',
      metaJson: params.meta ?? null,
    })
    .returning({ id: notifications.id });

  return row.id;
}

/**
 * Create notifications for multiple users at once (batch).
 * Useful for system-wide announcements.
 */
export async function createBulkNotifications(
  db: DrizzleDB,
  params: Omit<CreateNotificationParams, 'userId'> & { userIds: string[] },
): Promise<number> {
  if (params.userIds.length === 0) return 0;

  const values = params.userIds.map((userId) => ({
    userId,
    type: params.type,
    category: params.category,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
    priority: params.priority ?? 'normal',
    metaJson: params.meta ?? null,
  }));

  const rows = await db.insert(notifications).values(values).returning({ id: notifications.id });
  return rows.length;
}
