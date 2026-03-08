import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.about.title} — Doculet`,
  description: marketingCopy.about.subtitle,
  openGraph: {
    title: `${marketingCopy.about.title} — Doculet`,
    description: marketingCopy.about.subtitle,
    url: 'https://doculet.ai/about',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.about.title} — Doculet`,
    description: marketingCopy.about.subtitle,
  },
};

export default function AboutPage() {
  const { about } = marketingCopy;

  return (
    <MarketingPageShell title={about.title} description={about.subtitle}>
      <div className="space-y-8">
        <div className="rounded-xl border border-border/70 bg-background/70 p-5 md:p-6">
          <h2 className="font-serif text-2xl text-foreground">{about.mission.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{about.mission.body}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {about.values.map((v) => (
            <article key={v.title} className="rounded-xl border border-border/70 bg-background/70 p-5">
              <h3 className="font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </article>
          ))}
        </div>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href={about.ctaHref}>{about.cta}</Link>
        </Button>
      </div>
    </MarketingPageShell>
  );
}
