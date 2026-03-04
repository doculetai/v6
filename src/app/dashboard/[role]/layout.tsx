import { Suspense } from 'react';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardSkeleton } from '@/components/layout/DashboardSkeleton';
import { isDashboardRole } from '@/config/roles';

import { notFound } from 'next/navigation';

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

  return (
    <DashboardShell role={role}>
      <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
    </DashboardShell>
  );
}
