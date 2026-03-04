import type { Metadata } from 'next';

import { adminCopy } from '@/config/copy/admin';
import { api } from '@/trpc/server';

import { UsersPageClient } from './users-page-client';

export const metadata: Metadata = {
  title: adminCopy.users.title,
};

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function UsersPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'admin') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.users.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{adminCopy.errors.unauthorized}</p>
      </div>
    );
  }

  let result: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['admin']['listAllUsers']>> | null = null;

  try {
    const caller = await api();
    result = await caller.admin.listAllUsers({ limit: 50, offset: 0 });
  } catch {
    result = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{adminCopy.users.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{adminCopy.users.subtitle}</p>
      </div>
      <UsersPageClient
        data={result}
        copy={adminCopy.users}
      />
    </div>
  );
}
