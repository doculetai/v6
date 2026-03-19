/**
 * Maps domain events to notification parameters.
 * Centralizes all notification templates so they stay consistent.
 */

import type { CreateNotificationParams, NotificationType, NotificationCategory } from './create-notification';
import { routes } from '@/config/routes';

type EventConfig = {
  type: NotificationType;
  category: NotificationCategory;
  title: (ctx: Record<string, string>) => string;
  body: (ctx: Record<string, string>) => string;
  link: (ctx: Record<string, string>) => string | undefined;
  priority: CreateNotificationParams['priority'];
};

/** Notification event templates indexed by event key. */
export const NOTIFICATION_EVENTS: Record<string, EventConfig> = {
  // ─── Student Notifications ────────────────────────
  'student.doc_approved': {
    type: 'doc_approved',
    category: 'documents',
    title: () => 'Document approved',
    body: (ctx) => `Your ${ctx.documentType} has been approved.`,
    link: () => routes.dashboard.student.documents,
    priority: 'normal',
  },
  'student.doc_rejected': {
    type: 'doc_rejected',
    category: 'documents',
    title: () => 'Document requires attention',
    body: (ctx) => `Your ${ctx.documentType} was not accepted. ${ctx.reason}`,
    link: () => routes.dashboard.student.documents,
    priority: 'high',
  },
  'student.doc_more_info': {
    type: 'doc_more_info',
    category: 'documents',
    title: () => 'Additional information needed',
    body: (ctx) => `We need more details about your ${ctx.documentType}.`,
    link: () => routes.dashboard.student.documents,
    priority: 'high',
  },
  'student.cert_issued': {
    type: 'cert_issued',
    category: 'verification',
    title: () => 'Certificate ready',
    body: () => 'Your proof-of-funds certificate has been issued.',
    link: () => routes.dashboard.student.proof,
    priority: 'high',
  },
  'student.kyc_reminder': {
    type: 'kyc_reminder',
    category: 'verification',
    title: () => 'Complete your identity verification',
    body: () => 'Verify your identity to unlock bank connection and proof generation.',
    link: () => routes.dashboard.student.verification,
    priority: 'normal',
  },
  'student.disbursement_received': {
    type: 'disbursement_success',
    category: 'payments',
    title: () => 'Funds received',
    body: (ctx) => `${ctx.sponsorName} has sent ${ctx.amount} to your account.`,
    link: () => routes.dashboard.student.proof,
    priority: 'high',
  },

  // ─── Sponsor Notifications ────────────────────────
  'sponsor.invite_accepted': {
    type: 'invite_accepted',
    category: 'sponsorship',
    title: () => 'Student accepted your sponsorship',
    body: (ctx) => `${ctx.studentName} has accepted your sponsorship commitment.`,
    link: () => routes.dashboard.sponsor.students,
    priority: 'normal',
  },
  'sponsor.invite_rejected': {
    type: 'invite_rejected',
    category: 'sponsorship',
    title: () => 'Sponsorship invitation declined',
    body: (ctx) => `${ctx.studentName} has declined your sponsorship invitation.`,
    link: () => routes.dashboard.sponsor.students,
    priority: 'normal',
  },
  'sponsor.disbursement_success': {
    type: 'disbursement_success',
    category: 'payments',
    title: () => 'Disbursement sent successfully',
    body: (ctx) => `${ctx.amount} was sent to ${ctx.studentName}.`,
    link: () => routes.dashboard.sponsor.disbursements,
    priority: 'normal',
  },
  'sponsor.disbursement_failed': {
    type: 'disbursement_failed',
    category: 'payments',
    title: () => 'Disbursement failed',
    body: (ctx) => `The disbursement of ${ctx.amount} to ${ctx.studentName} could not be completed.`,
    link: () => routes.dashboard.sponsor.disbursements,
    priority: 'urgent',
  },

  // ─── University Notifications ─────────────────────
  'university.student_completed': {
    type: 'system',
    category: 'verification',
    title: () => 'Student verification complete',
    body: (ctx) => `${ctx.studentName} has completed proof-of-funds verification.`,
    link: () => routes.dashboard.university.students,
    priority: 'normal',
  },

  // ─── Admin Notifications ──────────────────────────
  'admin.risk_flag': {
    type: 'system',
    category: 'security',
    title: () => 'New risk flag detected',
    body: (ctx) => `${ctx.flagType} flagged for ${ctx.userName}.`,
    link: () => routes.dashboard.admin.risk,
    priority: 'high',
  },
};

/** Build notification params from an event key and context. */
export function buildNotificationFromEvent(
  eventKey: string,
  userId: string,
  context: Record<string, string>,
): CreateNotificationParams | null {
  const config = NOTIFICATION_EVENTS[eventKey];
  if (!config) return null;

  return {
    userId,
    type: config.type,
    category: config.category,
    title: config.title(context),
    body: config.body(context),
    link: config.link(context),
    priority: config.priority,
    meta: context,
  };
}
