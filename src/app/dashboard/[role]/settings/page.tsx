import { Fingerprint, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';

import { sponsorCopy } from '@/config/copy/sponsor';

import { SettingsPageClient } from './settings-page-client';

type SponsorSettingsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SponsorSettingsPage({ params }: SponsorSettingsPageProps) {
  const { role } = await params;

  if (role !== 'sponsor') {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm dark:border-border/70 dark:bg-card/70 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-border/80 dark:bg-background/40">
            <ShieldCheck className="size-4" aria-hidden="true" />
            <span>{sponsorCopy.settings.sessions.title}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {sponsorCopy.settings.title}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {sponsorCopy.settings.subtitle}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground dark:border-border/80 dark:bg-background/40">
            <Fingerprint className="size-5 text-primary" aria-hidden="true" />
            <span>{sponsorCopy.settings.sessions.description}</span>
          </div>
        </div>
      </header>

      <SettingsPageClient />
    </section>
  );
}
