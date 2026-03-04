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

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{agentCopy.actions.title}</h1>
      <ActionsPageClient copy={agentCopy.actions} />
    </div>
  );
}
