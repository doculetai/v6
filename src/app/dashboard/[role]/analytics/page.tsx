import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Analytics — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

const subtitles: Record<string, string> = {
  admin: 'Business intelligence',
  partner: 'Usage and conversion data',
};

export default async function AnalyticsPage({ params }: PageProps) {
  const { role } = await params;

  if (!['admin', 'partner'].includes(role)) {
    notFound();
  }

  const subtitle = (subtitles as Record<string, string>)[role] ?? '';

  return (
    <section className="space-y-8">
      <PageHeader title="Analytics" subtitle={subtitle} />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <BarChart3 className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Analytics</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
