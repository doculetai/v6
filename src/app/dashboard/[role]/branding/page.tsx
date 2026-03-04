import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Palette } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Branding — Doculet',
};

type PageProps = { params: Promise<{ role: string }> };

export default async function BrandingPage({ params }: PageProps) {
  const { role } = await params;

  if (!['partner'].includes(role)) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Branding</h1>
          <p className="text-sm text-muted-foreground sm:text-base">White-label customization</p>
        </div>
      </header>
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
        <Palette className="size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">This page is being built</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Full functionality for <strong>Branding</strong> is coming soon. Your navigation and layout are fully wired.
        </p>
      </div>
    </section>
  );
}
