import { redirect } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';

export type StudentOnboardingGateSession = {
  profileRole: DashboardRole | null;
  onboardingComplete: boolean;
};

/**
 * Redirects students with incomplete onboarding to /dashboard/student/onboarding.
 * Call this at the start of student-only pages (schools, verify, documents, proof).
 */
export async function enforceStudentOnboardingGate(
  session: StudentOnboardingGateSession,
): Promise<void> {
  if (session.profileRole === 'student' && !session.onboardingComplete) {
    redirect('/dashboard/student/onboarding');
  }
}
