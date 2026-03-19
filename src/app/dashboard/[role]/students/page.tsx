import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { agentCopy } from '@/config/copy/agent';
import { partnerCopy } from '@/config/copy/partner';
import { sponsorCopy } from '@/config/copy/sponsor';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { AgentStudentsPageClient } from './agent-students-page-client';
import { StudentsPageClient } from './students-page-client';
import { SponsorStudentsPageClient } from './sponsor-students-page-client';
import { UniversityStudentsPageClient } from './university-students-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: 'Students — Doculet' };

type StudentsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const caller = await api();

  // Sponsor branch
  if (role === 'sponsor') {
    const [invitesResult, studentsResult] = await Promise.allSettled([
      caller.sponsor.listPendingInvites(),
      caller.sponsor.listSponsoredStudents(),
    ]);
    if (
      invitesResult.status === 'rejected' &&
      invitesResult.reason instanceof TRPCError &&
      invitesResult.reason.code === 'UNAUTHORIZED'
    ) {
      redirect(routes.auth.login);
    }
    const invites = invitesResult.status === 'fulfilled' ? invitesResult.value : [];
    const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
    return (
      <PageShell>
        <PageHeader title={sponsorCopy.students.title} subtitle={sponsorCopy.students.subtitle} />
        <SponsorStudentsPageClient invites={invites} students={students} copy={sponsorCopy.students} />
      </PageShell>
    );
  }

  // University branch
  if (role === 'university') {
    const [studentsResult, programsResult] = await Promise.allSettled([
      caller.university.listUniversityStudentsWithCert({}),
      caller.university.listUniversityPrograms(),
    ]);
    if (studentsResult.status === 'rejected') {
      const err = studentsResult.reason;
      if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    }
    const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
    const programs = programsResult.status === 'fulfilled' ? programsResult.value : [];
    return (
      <PageShell>
        <PageHeader
          title={universityCopy.students.title}
          subtitle={universityCopy.students.subtitle}
        />
        <UniversityStudentsPageClient initialStudents={students} programs={programs} copy={universityCopy.students} />
      </PageShell>
    );
  }

  // Agent branch
  if (role === 'agent') {
    const [studentsResult] = await Promise.allSettled([caller.agent.listAgentStudents()]);
    if (studentsResult.status === 'rejected') {
      const err = studentsResult.reason;
      if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    }
    const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
    return (
      <PageShell>
        <PageHeader
          title={agentCopy.students.title}
          subtitle={agentCopy.students.subtitle}
        />
        <AgentStudentsPageClient students={students} copy={agentCopy.students} />
      </PageShell>
    );
  }

  // Partner branch (existing)
  if (role === 'partner') {
    let students: { id: string; studentId: string; tier: number; verifiedAt: Date; schoolName: string | null }[];

    try {
      students = await caller.partner.listStudents();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
        redirect(routes.auth.login);
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        notFound();
      }
      throw error;
    }

    return (
      <PageShell>
        <PageHeader
          title={partnerCopy.students.title}
          subtitle={partnerCopy.students.subtitle}
        />
        <StudentsPageClient students={students} copy={partnerCopy.students} />
      </PageShell>
    );
  }

  notFound();
}
