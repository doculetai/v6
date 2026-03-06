import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardSkeleton } from '@/components/layout/DashboardSkeleton';
import { isDashboardRole } from '@/config/roles';
import { computeStudentTrustStage } from '@/lib/student-trust-stage';
import type { StudentTrustStage } from '@/lib/student-trust-stage';
import { api } from '@/trpc/server';
import { TRPCReactProvider } from '@/trpc/provider';

type DashboardRoleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
};

export default async function DashboardRoleLayout({
  children,
  params,
}: DashboardRoleLayoutProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  let studentTrustStage: StudentTrustStage | undefined;

  if (role === 'student') {
    try {
      const caller = await api();
      const trustData = await caller.student.getTrustStageData();
      studentTrustStage = computeStudentTrustStage(trustData);
    } catch {
      studentTrustStage = 0;
    }
  }

  return (
    <TRPCReactProvider>
      <DashboardShell role={role} studentTrustStage={studentTrustStage}>
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </DashboardShell>
    </TRPCReactProvider>
  );
}
