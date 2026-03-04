import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { StudentsPageClient } from './students-page-client';

export const metadata: Metadata = {
  title: 'Students — Doculet Partner',
};

type StudentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  if (role !== 'partner') {
    notFound();
  }

  let students: { id: string; studentId: string; tier: number; verifiedAt: Date; schoolName: string | null }[];

  try {
    const caller = await api();
    students = await caller.partner.listStudents();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }

    throw error;
  }

  return <StudentsPageClient students={students} copy={partnerCopy.students} />;
}
