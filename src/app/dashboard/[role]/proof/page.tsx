import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { BlockedStatePage } from '@/components/ui/blocked-state-page';
import { studentCopy } from '@/config/copy/student';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';

import { ProofPageClient } from './proof-page-client';
import { routes } from '@/config/routes';

export const metadata = { title: 'Proof of Funds — Doculet' };

type DashboardProofPageProps = {
  params: Promise<{ role: string }>;
};

type StudentProofData = inferRouterOutputs<AppRouter>['student']['getProofCertificate'];

export default async function DashboardProofPage({ params }: DashboardProofPageProps) {
  const { role } = await params;

  if (role !== 'student') {
    notFound();
  }

  const caller = await api();
  const session = await caller.dashboard.getSession({ role: 'student' });
  const { enforceStudentOnboardingGate } = await import('@/lib/auth/student-onboarding-gate');
  await enforceStudentOnboardingGate({
    profileRole: session.profileRole,
    onboardingComplete: session.onboardingComplete,
  });

  let initialData: StudentProofData;

  try {
    initialData = await caller.student.getProofCertificate();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect(routes.auth.login);
    }

    throw new Error(studentCopy.proof.states.errorTitle);
  }

  if (!initialData.checklist.documentsComplete) {
    return <BlockedStatePage {...studentCopy.blocked.proof} />;
  }

  async function generateProofShareLinkAction() {
    'use server';

    const actionCaller = await api();
    return actionCaller.student.generateProofShareLink();
  }

  return (
    <ProofPageClient
      initialData={initialData}
      generateProofShareLinkAction={generateProofShareLinkAction}
    />
  );
}
