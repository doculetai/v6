import type { Metadata } from 'next';

import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.privacy.title} — Doculet`,
  description: marketingCopy.privacy.metaDescription,
  openGraph: {
    title: `${marketingCopy.privacy.title} — Doculet`,
    description: marketingCopy.privacy.metaDescription,
    url: 'https://doculet.ai/privacy',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.privacy.title} — Doculet`,
    description: marketingCopy.privacy.metaDescription,
  },
};

export default function PrivacyPage() {
  const { privacy } = marketingCopy;

  return (
    <MarketingPageShell title={privacy.title} description={privacy.subtitle}>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{privacy.intro}</p>
        {privacy.sections.map((s) => (
          <article key={s.heading} className="rounded-xl border border-border/70 bg-background/70 p-5">
            <h2 className="font-semibold text-foreground">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </article>
        ))}
      </div>
    </MarketingPageShell>
  );
}
