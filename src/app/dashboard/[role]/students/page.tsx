import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';
import { PageHeader } from '@/components/ui/page-header';

import { StudentsPageClient } from './students-page-client';
import { SponsorStudentsPageClient } from './sponsor-students-page-client';

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
    try {
      const [invitesResult, studentsResult] = await Promise.allSettled([
        caller.sponsor.listPendingInvites(),
        caller.sponsor.listSponsoredStudents(),
      ]);
      const invites = invitesResult.status === 'fulfilled' ? invitesResult.value : [];
      const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
      return (
        <div className="space-y-6">
          <h1 className="sr-only">{sponsorCopy.students.title}</h1>
          <PageHeader title={sponsorCopy.students.title} subtitle={sponsorCopy.students.subtitle} />
          <SponsorStudentsPageClient invites={invites} students={students} copy={sponsorCopy.students} />
        </div>
      );
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') redirect('/login');
      throw error;
    }
  }

  // Partner branch (existing)
  if (role === 'partner') {
    let students: { id: string; studentId: string; tier: number; verifiedAt: Date; schoolName: string | null }[];

    try {
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

    return (
      <div className="space-y-6">
        <h1 className="sr-only">{partnerCopy.students.title}</h1>
        <PageHeader
          title={partnerCopy.students.title}
          subtitle={partnerCopy.students.subtitle}
        />
        <StudentsPageClient students={students} copy={partnerCopy.students} />
      </div>
    );
  }

  notFound();
}
