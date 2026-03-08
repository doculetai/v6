import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { TRPCError } from '@trpc/server';

import { universityCopy } from '@/config/copy/university';
import { api } from '@/trpc/server';

import { UniversityProgramsPageClient } from './university-programs-page-client';

export const metadata: Metadata = { title: 'Programs — Doculet' };

type ProgramsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function ProgramsPage({ params }: ProgramsPageProps) {
  const { role } = await params;

  if (role !== 'university') {
    notFound();
  }

  const caller = await api();
  let programs: Awaited<ReturnType<typeof caller.university.listUniversityPrograms>>;
  try {
    programs = await caller.university.listUniversityPrograms();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') redirect('/login');
    programs = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{universityCopy.programs.title}</h1>
      <UniversityProgramsPageClient
        initialPrograms={programs}
        copy={universityCopy.programs}
      />
    </div>
  );
}
