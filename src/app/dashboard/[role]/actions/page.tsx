import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { agentCopy } from '@/config/copy/agent';

import { ActionsPageClient } from './actions-page-client';

export const metadata: Metadata = { title: `${agentCopy.actions.title} — Doculet` };

type PageProps = { params: Promise<{ role: string }> };

export default async function ActionsPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'agent') {
    notFound();
  }

  return <ActionsPageClient copy={agentCopy.actions} referralUrl={null} />;
}
