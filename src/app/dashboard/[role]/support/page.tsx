import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { studentCopy } from '@/config/copy/student';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { SupportPageClient } from './support-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: `${studentCopy.support.title} — Doculet` };

type SupportPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SupportPage({ params }: SupportPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role) || role !== 'student') {
    notFound();
  }

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role: 'student' });
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect(routes.auth.login);
    }
    throw error;
  }

  return <SupportPageClient copy={studentCopy.support} />;
}
