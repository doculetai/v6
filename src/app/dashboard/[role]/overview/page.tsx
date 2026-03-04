import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

import { OverviewPageClient } from './overview-page-client';

export const metadata: Metadata = {
  title: 'Overview — Doculet University',
  description: 'Summary of pending verifications, approvals, and student activity.',
};

type PageProps = {
  params: Promise<{ role: string }>;
};

async function fetchOverviewData() {
  try {
    const caller = await api();
    return await caller.university.getOverview();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    throw error;
  }
}

export default async function UniversityOverviewPage({ params }: PageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const data = await fetchOverviewData();
  return (
    <div className="space-y-6">
      <h1 className="sr-only">{universityCopy.overview.title}</h1>
      <PageHeader
        title={universityCopy.overview.title}
        subtitle={universityCopy.overview.subtitle}
        actions={
          <Button asChild size="sm" variant="outline" className="min-h-11">
            <Link href="/dashboard/university/pipeline">{universityCopy.nav.pipeline}</Link>
          </Button>
        }
      />
      <OverviewPageClient data={data} />
    </div>
  );
}
