import { TRPCError } from '@trpc/server';
import type { inferRouterOutputs } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { studentCopy } from '@/config/copy/student';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';
import { TRPCReactProvider } from '@/trpc/provider';

import { SchoolsPageClient } from './schools-page-client';

export const metadata: Metadata = {
  title: 'Schools — Doculet',
};

type SchoolsRolePageProps = {
  params: Promise<{ role: string }>;
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type ListSchoolsOutput = RouterOutput['student']['listSchools'];
type StudentSchoolSelection = RouterOutput['student']['getStudentSchoolSelection'];

export default async function SchoolsRolePage({ params }: SchoolsRolePageProps) {
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

  let initialSchools: ListSchoolsOutput;
  let initialSelection: StudentSchoolSelection;

  try {
    [initialSchools, initialSelection] = await Promise.all([
      caller.student.listSchools({ limit: 50, offset: 0 }),
      caller.student.getStudentSchoolSelection(),
    ]);
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
      <PageHeader
        title={studentCopy.schools.title}
        breadcrumbs={[
          { label: 'Overview', href: `/dashboard/${role}` },
          { label: studentCopy.schools.title },
        ]}
      />
      <TRPCReactProvider>
        <SchoolsPageClient initialSchools={initialSchools} initialSelection={initialSelection} />
      </TRPCReactProvider>
    </>
  );
}
