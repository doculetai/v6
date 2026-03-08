import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { api } from '@/trpc/server';

import { UsersPageClient } from './users-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: adminCopy.users.title,
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function UsersPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'admin') {
    notFound();
  }

  const caller = await api();

  const [resultResult] = await Promise.allSettled([caller.admin.listAllUsers({ limit: 50, offset: 0 })]);
  if (resultResult.status === 'rejected') {
    const err = resultResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const result = resultResult.status === 'fulfilled' ? resultResult.value : null;

  return (
    <PageShell>
      <PageHeader title={adminCopy.users.title} subtitle={adminCopy.users.subtitle} />
      <UsersPageClient data={result} copy={adminCopy.users} />
    </PageShell>
  );
}
