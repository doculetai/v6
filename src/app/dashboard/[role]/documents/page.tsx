import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import type { DashboardRole } from '@/config/roles';
import { studentCopy } from '@/config/copy/student';
import { api } from '@/trpc/server';

import { DocumentsPageClient } from './documents-page-client';

type StudentDocumentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentDocumentsPage({ params }: StudentDocumentsPageProps) {
  const { role } = await params;

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

  return (
    <>
      <h1 className="sr-only">{studentCopy.documents.title}</h1>
      <DocumentsPageClient />
    </>
  );
}
