import type { NavQuickAction } from '@/config/nav/types';
import { routes } from '@/config/routes';

interface SponsorQuickActionInput {
  pendingInvites: number;
  kycVerified: boolean;
}

const QUICK_ACTIONS = {
  reviewInvites: {
    label: 'Review invites',
    href: routes.dashboard.sponsor.students,
  },
  completeKyc: {
    label: 'Complete KYC',
    href: routes.dashboard.sponsor.kyc,
  },
  viewStudents: {
    label: 'View students',
    href: routes.dashboard.sponsor.students,
  },
} as const;

/**
 * Returns a stage-aware quick action for the sponsor sidebar.
 * Priority: pending invites > incomplete KYC > default view students.
 */
export function getSponsorQuickAction(
  data: SponsorQuickActionInput,
  icon: NavQuickAction['icon'],
): NavQuickAction {
  if (data.pendingInvites > 0) {
    return { ...QUICK_ACTIONS.reviewInvites, icon };
  }

  if (!data.kycVerified) {
    return { ...QUICK_ACTIONS.completeKyc, icon };
  }

  return { ...QUICK_ACTIONS.viewStudents, icon };
}
