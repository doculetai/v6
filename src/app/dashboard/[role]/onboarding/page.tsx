import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { studentOnboardingCopy } from '@/config/copy/student-onboarding.copy';
import { sponsorCopy } from '@/config/copy/sponsor';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { OnboardingPageClient } from './onboarding-page-client';
import { SponsorOnboardingPageClient } from './sponsor-onboarding-page-client';
import { UniversityOnboardingPageClient } from './university-onboarding-page-client';

type OnboardingPageProps = {
  params: Promise<{ role: string }>;
};

const SUPPORTED_ONBOARDING_ROLES = ['student', 'sponsor', 'university'] as const;
type OnboardingRole = (typeof SUPPORTED_ONBOARDING_ROLES)[number];

function isOnboardingRole(role: string): role is OnboardingRole {
  return (SUPPORTED_ONBOARDING_ROLES as readonly string[]).includes(role);
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || !isOnboardingRole(role)) {
    notFound();
  }

  // Students use /setup instead
  if (role === 'student') {
    redirect(`/dashboard/student/setup`);
  }

  try {
    const caller = await api();
    const session = await caller.dashboard.getSession({ role });

    if (session.profileRole && session.profileRole !== role) {
      redirect(`/dashboard/${session.profileRole}`);
    }

    if (!session.profileRole) {
      redirect(`/dashboard/${role}`);
    }

    if (session.onboardingComplete) {
      redirect(`/dashboard/${role}`);
    }
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    throw error;
  }

  if (role === 'sponsor') {
    return (
      <>
        <h1 className="sr-only">{sponsorCopy.onboarding.title}</h1>
        <SponsorOnboardingPageClient />
      </>
    );
  }

  if (role === 'university') {
    return (
      <>
        <h1 className="sr-only">{universityCopy.onboarding.title}</h1>
        <UniversityOnboardingPageClient />
      </>
    );
  }

  return (
    <>
      <h1 className="sr-only">{studentOnboardingCopy.onboardingWizard.title}</h1>
      <OnboardingPageClient />
    </>
  );
}
