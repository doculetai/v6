import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Activity } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Activity — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

export default async function ActivityPage({ params }: PageProps) {
  const { role } = await params;

  if (!['agent'].includes(role)) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <h1 className="sr-only">Activity</h1>
      <PageHeader title="Activity" subtitle="Recent actions and events" />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <Activity className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Activity</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
