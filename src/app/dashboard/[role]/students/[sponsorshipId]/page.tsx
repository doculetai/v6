import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/content-primitives';
import { sponsorCopy } from '@/config/copy/sponsor';
import { primitivesCopy } from '@/config/copy/primitives';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { SponsorStudentDetailClient } from './sponsor-student-detail-client';
import { routes } from '@/config/routes';

type PageProps = {
  params: Promise<{ role: string; sponsorshipId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  if (role !== 'sponsor') return { title: 'Students — Doculet' };
  return { title: `${sponsorCopy.studentDetail.title} — Doculet` };
}

export default async function SponsorStudentDetailPage({ params }: PageProps) {
  const { role, sponsorshipId } = await params;

  if (!isDashboardRole(role) || role !== 'sponsor') {
    notFound();
  }

  const caller = await api();
  let detail: Awaited<ReturnType<typeof caller.sponsor.getSponsorStudentDetail>>;

  try {
    detail = await caller.sponsor.getSponsorStudentDetail({ sponsorshipId });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={sponsorCopy.studentDetail.title}
        breadcrumbs={[
          { label: primitivesCopy.nav.overview, href: `/dashboard/${role}` },
          { label: sponsorCopy.students.title, href: `/dashboard/${role}/students` },
          { label: sponsorCopy.studentDetail.title },
        ]}
      />
      <SponsorStudentDetailClient
        detail={detail}
        copy={sponsorCopy.studentDetail}
        disbursementCopy={sponsorCopy.disbursements}
      />
    </>
  );
}
