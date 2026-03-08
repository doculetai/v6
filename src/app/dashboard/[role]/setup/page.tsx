import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { api } from '@/trpc/server';

import { OnboardingPageClient } from '../onboarding/onboarding-page-client';
import { routes } from '@/config/routes';

export const metadata = { title: 'Profile Setup — Doculet' };

type Props = { params: Promise<{ role: string }> };

export default async function SetupPage({ params }: Props) {
  const { role } = await params;
  if (role !== 'student') notFound();

  try {
    const caller = await api();
    const session = await caller.dashboard.getSession({ role });

    if (session.onboardingComplete) {
      redirect(`/dashboard/student`);
    }
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect(routes.auth.login);
    }
    throw error;
  }

  return <OnboardingPageClient />;
}
