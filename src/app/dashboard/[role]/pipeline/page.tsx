import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KanbanSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Pipeline — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

export default async function PipelinePage({ params }: PageProps) {
  const { role } = await params;

  if (!['university'].includes(role)) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <PageHeader title="Pipeline" subtitle="Applicant review pipeline" />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <KanbanSquare className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Pipeline</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
