import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';
import { BlockedStatePage } from '@/components/ui/blocked-state-page';
import { studentCopy } from '@/config/copy/student';
import { api } from '@/trpc/server';

export const metadata: Metadata = { title: 'Documents — Doculet' };

import { DocumentsPageClient } from './documents-page-client';
import { routes } from '@/config/routes';

type StudentDocumentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentDocumentsPage({ params }: StudentDocumentsPageProps) {
  const { role } = await params;

  if (role !== 'student') {
    notFound();
  }

  let session: { profileRole: DashboardRole | null; onboardingComplete: boolean };
  const caller = await api();

  try {
    session = await caller.dashboard.getSession({ role: 'student' });
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect(routes.auth.login);
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  if (session.profileRole !== 'student') {
    redirect(routes.dashboard.student.overview);
  }

  const { enforceStudentOnboardingGate } = await import('@/lib/auth/student-onboarding-gate');
  await enforceStudentOnboardingGate({
    profileRole: session.profileRole,
    onboardingComplete: session.onboardingComplete,
  });

  const verificationResult = await caller.student.getVerificationStatus().catch(() => null);
  const t2Complete = Boolean(verificationResult?.tiers.find((t) => t.tier === 2)?.isComplete);

  if (!t2Complete) {
    return <BlockedStatePage {...studentCopy.blocked.documents} />;
  }

  return <DocumentsPageClient />;
}
