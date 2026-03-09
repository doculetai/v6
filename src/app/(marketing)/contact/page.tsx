import type { Metadata } from 'next';

import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.contact.title} — Doculet`,
  description: 'Get in touch with the Doculet team.',
  openGraph: {
    title: `${marketingCopy.contact.title} — Doculet`,
    description: 'Get in touch with the Doculet team.',
    url: 'https://doculet.ai/contact',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.contact.title} — Doculet`,
    description: 'Get in touch with the Doculet team.',
  },
};

export default function ContactPage() {
  const { contact } = marketingCopy;

  return (
    <MarketingPageShell title={contact.title} description={contact.subtitle}>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border/70 bg-background/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {contact.supportLabel}
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 block text-base font-medium text-primary hover:underline"
          >
            {contact.email}
          </a>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contact.supportNote}</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-background/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {contact.enterpriseLabel}
          </p>
          <a
            href={`mailto:${contact.enterpriseEmail}`}
            className="mt-2 block text-base font-medium text-primary hover:underline"
          >
            {contact.enterpriseEmail}
          </a>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contact.enterpriseNote}</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-background/70 p-5 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{contact.address}</p>
        </article>
      </div>
    </MarketingPageShell>
  );
}
