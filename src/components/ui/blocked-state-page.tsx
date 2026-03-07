import Link from 'next/link';

import { LockKey } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PageShell, Section } from '@/components/layout/content-primitives';

type BlockedStatePageProps = {
  pageTitle: string;
  eyebrow?: string;
  blockedTitle: string;
  blockedReason: string;
  ctaLabel: string;
  ctaHref: string;
};

export function BlockedStatePage({
  pageTitle,
  eyebrow,
  blockedTitle,
  blockedReason,
  ctaLabel,
  ctaHref,
}: BlockedStatePageProps) {
  return (
    <PageShell>
      <Section>
        <div className="flex flex-col gap-1 pb-6">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
        </div>
      </Section>
      <Section>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center max-w-md mx-auto">
          <LockKey weight="duotone" className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{blockedTitle}</p>
            <p className="text-sm text-muted-foreground">{blockedReason}</p>
          </div>
          <Button asChild size="sm">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
