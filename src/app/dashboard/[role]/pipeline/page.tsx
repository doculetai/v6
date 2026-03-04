import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { PipelinePageClient } from './pipeline-page-client';

export const metadata: Metadata = { title: 'Application Pipeline — Doculet' };

type PipelinePageProps = {
  params: Promise<{ role: string }>;
};

export default async function PipelinePage({ params }: PipelinePageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'university') {
    notFound();
  }

  const caller = await api();

  let queue: Awaited<ReturnType<typeof caller.university.getVerificationQueue>> = [];

  try {
    queue = await caller.university.getVerificationQueue();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      notFound();
    }
    throw error;
  }

  const copy = universityCopy.pipeline;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{copy.title}</h1>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <PipelinePageClient queue={queue} />
    </div>
  );
}
