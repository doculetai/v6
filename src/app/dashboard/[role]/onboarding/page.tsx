import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { OnboardingPageClient } from './onboarding-page-client';

type StudentOnboardingPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentOnboardingPage({ params }: StudentOnboardingPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'student') {
    notFound();
  }

  try {
    const caller = await api();
    const session = await caller.dashboard.getSession({ role: 'student' });

    if (session.profileRole && session.profileRole !== 'student') {
      redirect(`/dashboard/${session.profileRole}`);
    }

    if (!session.profileRole) {
      redirect('/dashboard/student');
    }

    if (session.onboardingComplete) {
      redirect('/dashboard/student');
    }
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    throw error;
  }

  return <OnboardingPageClient />;
}
