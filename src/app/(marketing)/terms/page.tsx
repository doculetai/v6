import type { Metadata } from 'next';

import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.terms.title} — Doculet`,
  description: marketingCopy.terms.metaDescription,
  openGraph: {
    title: `${marketingCopy.terms.title} — Doculet`,
    description: marketingCopy.terms.metaDescription,
    url: 'https://doculet.ai/terms',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.terms.title} — Doculet`,
    description: marketingCopy.terms.metaDescription,
  },
};

export default function TermsPage() {
  const { terms } = marketingCopy;

  return (
    <MarketingPageShell title={terms.title} description={terms.subtitle}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{terms.intro}</p>
        {terms.sections.map((s) => (
          <article key={s.heading} className="rounded-xl border border-border/70 bg-background/70 p-5">
            <h2 className="font-semibold text-foreground">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </article>
        ))}
      </div>
    </MarketingPageShell>
  );
}
