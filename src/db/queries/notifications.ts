import { notifications } from '@/db/schema';
import type { DrizzleDB } from '@/db';

type NotificationType = typeof notifications.$inferInsert['type'];

interface InsertNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  category?: string;
  priority?: 'normal' | 'high';
  metaJson?: Record<string, unknown>;
}

/**
 * Insert a single in-app notification for a user.
 * This is a fire-and-forget helper — callers should wrap in try/catch
 * if they do not want notification failures to abort the parent mutation.
 */
export async function insertNotification(db: DrizzleDB, input: InsertNotificationInput) {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    category: input.category,
    priority: input.priority ?? 'normal',
    metaJson: input.metaJson ?? null,
  });
}

/** Maps a document type slug to a human-readable label suitable for notification copy. */
export function documentTypeLabel(
  docType: 'passport' | 'bank_statement' | 'offer_letter' | 'affidavit' | 'cac' | null | undefined,
): string {
  switch (docType) {
    case 'passport':
      return 'passport';
    case 'bank_statement':
      return 'bank statement';
    case 'offer_letter':
      return 'offer letter';
    case 'affidavit':
      return 'affidavit';
    case 'cac':
      return 'CAC document';
    default:
      return 'document';
  }
}
