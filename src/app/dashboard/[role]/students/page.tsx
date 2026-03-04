import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { universityCopy } from '@/config/copy/university';
import type { UniversityStudentRow } from '@/db/queries/university-students';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { StudentsPageClient } from './students-page-client';

export const metadata: Metadata = {
  title: 'Students — Doculet.ai',
  description: 'View all students associated with your institution.',
};

type StudentsPageProps = {
  params: Promise<{ role: string }>;
};

const copy = universityCopy.students;

type FetchResult =
  | { type: 'ok'; data: UniversityStudentRow[] }
  | { type: 'unauthorized' }
  | { type: 'error' };

async function fetchStudents(): Promise<FetchResult> {
  try {
    const caller = await api();
    const data = await caller.university.listStudents();
    return { type: 'ok', data };
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')
    ) {
      return { type: 'unauthorized' };
    }
    return { type: 'error' };
  }
}

export default async function UniversityStudentsPage({ params }: StudentsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const result = await fetchStudents();

  if (result.type === 'unauthorized') {
    redirect('/login');
  }

  if (result.type === 'error') {
    return (
      <div className="space-y-6">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <EmptyState heading={copy.error.heading} body={copy.error.body} />
      </div>
    );
  }

  return <StudentsPageClient initialData={result.data} />;
}
