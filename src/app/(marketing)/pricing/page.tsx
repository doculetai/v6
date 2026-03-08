import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.pricing.title} — Doculet`,
  description: marketingCopy.pricing.subtitle,
  openGraph: {
    title: `${marketingCopy.pricing.title} — Doculet`,
    description: marketingCopy.pricing.subtitle,
    url: 'https://doculet.ai/pricing',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.pricing.title} — Doculet`,
    description: marketingCopy.pricing.subtitle,
  },
};

export default function PricingPage() {
  const { pricing } = marketingCopy;

  return (
    <MarketingPageShell title={pricing.title} description={pricing.subtitle}>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">{pricing.student.title}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-2xl font-bold text-foreground">{pricing.student.certFee}</span>
                <span className="ml-2 text-sm text-muted-foreground">{pricing.student.certFeeLabel}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {pricing.student.renewalLabel}: {pricing.student.renewalFee}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {pricing.student.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link href={pricing.ctaHref}>{pricing.cta}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">{pricing.university.title}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-2xl font-bold text-foreground">{pricing.university.free}</span>
                <span className="ml-2 text-sm text-muted-foreground">{pricing.university.freeLabel}</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {pricing.university.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
      </div>
    </MarketingPageShell>
  );
}
