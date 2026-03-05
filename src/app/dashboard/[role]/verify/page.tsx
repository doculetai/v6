import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { studentCopy } from '@/config/copy/student';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';
import { TRPCReactProvider } from '@/trpc/provider';

import { VerifyPageClient } from './verify-page-client';

type VerifyRolePageProps = {
  params: Promise<{ role: string }>;
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type VerificationStatusOutput = RouterOutput['student']['getVerificationStatus'];

export default async function VerifyRolePage({ params }: VerifyRolePageProps) {
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

  let initialData: VerificationStatusOutput;

  try {
    initialData = await caller.student.getVerificationStatus();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  return (
    <>
      <h1 className="sr-only">{studentCopy.verify.title}</h1>
      <TRPCReactProvider>
        <VerifyPageClient initialData={initialData} />
      </TRPCReactProvider>
    </>
  );
}
