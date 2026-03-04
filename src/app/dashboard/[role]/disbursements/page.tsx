import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HandCoins } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Disbursements — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

export default async function DisbursementsPage({ params }: PageProps) {
  const { role } = await params;

  if (!['sponsor'].includes(role)) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <h1 className="sr-only">Disbursements</h1>
      <PageHeader title="Disbursements" subtitle="Fund transfers and schedules" />
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <HandCoins className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Disbursements</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
