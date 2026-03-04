import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import type { SponsorStudentCardItem } from '@/components/sponsor/SponsorStudentCard';
import { api } from '@/trpc/server';

import StudentsPageClient from './students-page-client';

type SponsorStudentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SponsorStudentsPage({ params }: SponsorStudentsPageProps) {
  const { role } = await params;

  if (role !== 'sponsor') {
    notFound();
  }

  let students: SponsorStudentCardItem[] = [];

  try {
    const caller = await api();
    const result = await caller.sponsor.getStudents();
    students = result.students;
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    throw error;
  }

  return <StudentsPageClient initialStudents={students} />;
}
