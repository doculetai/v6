import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';
import { studentCopy } from '@/config/copy/student';
import { universityCopy } from '@/config/copy/university';
import { PageHeader } from '@/components/ui/page-header';
import { api } from '@/trpc/server';

export const metadata: Metadata = { title: 'Documents — Doculet' };

import { DocumentsPageClient } from './documents-page-client';
import { UniversityDocumentsPageClient } from './university-documents-page-client';

type StudentDocumentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentDocumentsPage({ params }: StudentDocumentsPageProps) {
  const { role } = await params;

  // University branch
  if (role === 'university') {
    const caller = await api();
    const [docsResult] = await Promise.allSettled([
      caller.university.getUniversityDocumentQueue(),
    ]);
    const docs = docsResult.status === 'fulfilled' ? docsResult.value : [];
    return (
      <div className="space-y-6">
        <h1 className="sr-only">{universityCopy.documents.title}</h1>
        <PageHeader
          title={universityCopy.documents.title}
          subtitle={universityCopy.documents.subtitle}
        />
        <UniversityDocumentsPageClient documents={docs} copy={universityCopy.documents} />
      </div>
    );
  }

  if (role !== 'student') {
    notFound();
  }

  let session: { profileRole: DashboardRole | null };

  try {
    const caller = await api();
    session = await caller.dashboard.getSession({ role: 'student' });
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  if (session.profileRole !== 'student') {
    redirect('/dashboard/student');
  }

  const { enforceStudentOnboardingGate } = await import('@/lib/auth/student-onboarding-gate');
  await enforceStudentOnboardingGate({
    profileRole: session.profileRole,
    onboardingComplete: session.onboardingComplete,
  });

  return (
    <>
      <h1 className="sr-only">{studentCopy.documents.title}</h1>
      <DocumentsPageClient />
    </>
  );
}
