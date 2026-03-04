import type { Metadata } from 'next';
import { TRPCError } from '@trpc/server';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/ui/page-header';
import type { DocumentRow, DocumentStats } from '@/components/university/document-row-types';
import { universityCopy } from '@/config/copy/university';
import { api } from '@/trpc/server';

import { DocumentsPageClient } from './documents-page-client';

export const metadata: Metadata = {
  title: 'Document review queue — Doculet',
};

export default async function UniversityDocumentsPage() {
  let documents: DocumentRow[] = [];
  let stats: DocumentStats = { total: 0, pending: 0, approved: 0, moreInfoRequested: 0 };

  try {
    const caller = await api();
    [documents, stats] = await Promise.all([
      caller.university.listDocuments({}),
      caller.university.getDocumentStats(),
    ]);
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      redirect('/dashboard');
    }
    throw error;
  }

  const copy = universityCopy.documents;

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <DocumentsPageClient documents={documents} stats={stats} />
    </div>
  );
}
