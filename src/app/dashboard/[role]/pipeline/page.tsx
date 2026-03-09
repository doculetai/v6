import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { PipelinePageClient } from './pipeline-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${universityCopy.pipeline.title} — Doculet` };

type PipelinePageProps = {
  params: Promise<{ role: string }>;
};

export default async function PipelinePage({ params }: PipelinePageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'university') {
    notFound();
  }

  const caller = await api();

  const [queueResult] = await Promise.allSettled([caller.university.getVerificationQueue()]);
  if (queueResult.status === 'rejected') {
    const err = queueResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    if (err instanceof TRPCError && err.code === 'FORBIDDEN') notFound();
  }
  const queue = queueResult.status === 'fulfilled' ? queueResult.value : [];

  const copy = universityCopy.pipeline;

  return (
    <PageShell>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <PipelinePageClient queue={queue} />
    </PageShell>
  );
}
