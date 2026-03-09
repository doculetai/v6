import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Container,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { Card, CardContent } from '@/components/ui/card';
import { marketingCopy } from '@/config/copy/marketing';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/trpc/server';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: `${marketingCopy.certificate.title} — Doculet`,
  description: marketingCopy.certificate.metaDescription,
  openGraph: {
    title: `${marketingCopy.certificate.title} — Doculet`,
    description: marketingCopy.certificate.metaDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${marketingCopy.certificate.title} — Doculet`,
    description: marketingCopy.certificate.metaDescription,
  },
};

type CertificatePageProps = {
  params: Promise<{ token: string }>;
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { token } = await params;
  const caller = await api();
  const result = await caller.certificate.verifyByToken({ token });
  const copy = marketingCopy.certificate;

  if (!result.found) {
    return (
      <PageShell width="narrow" className="py-8 md:py-12">
        <Section>
          <PageHeader title={copy.title} description={copy.notFound} />
          <Container>
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link href={routes.marketing.landing}>{copy.verifyAnother}</Link>
            </Button>
          </Container>
        </Section>
      </PageShell>
    );
  }

  const statusLabel = result.valid ? copy.verified : copy.invalid;

  return (
    <PageShell width="narrow" className="py-8 md:py-12">
      <Section>
        <PageHeader title={copy.title} description={statusLabel} />
        <Container className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{copy.status}</span>
                  <span
                    className={
                      result.valid
                        ? 'rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success'
                        : 'rounded-full bg-destructive/20 px-3 py-1 text-sm font-medium text-destructive'
                    }
                  >
                    {statusLabel}
                  </span>
                </div>
                {result.holderLabel && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.holder}</span>
                    <p className="font-medium text-foreground">{result.holderLabel}</p>
                  </div>
                )}
                {result.schoolName && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.institution}</span>
                    <p className="font-medium text-foreground">{result.schoolName}</p>
                  </div>
                )}
                {result.programName && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.program}</span>
                    <p className="font-medium text-foreground">{result.programName}</p>
                  </div>
                )}
                {result.amountKobo != null && result.currency && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.amount}</span>
                    <p className="font-medium text-foreground">
                      {formatCurrency(result.amountKobo, result.currency)}
                    </p>
                  </div>
                )}
                {result.issuedAt && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.issued}</span>
                    <p className="font-medium text-foreground">
                      {new Date(result.issuedAt).toLocaleDateString('en-NG', {
                        dateStyle: 'medium',
                      })}
                    </p>
                  </div>
                )}
                {result.validUntil && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.expires}</span>
                    <p className="font-medium text-foreground">
                      {new Date(result.validUntil).toLocaleDateString('en-NG', {
                        dateStyle: 'medium',
                      })}
                    </p>
                  </div>
                )}
                {result.tier != null && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.tier}</span>
                    <p className="font-medium text-foreground">{copy.tierLabel(result.tier)}</p>
                  </div>
                )}
                {result.certId && (
                  <div>
                    <span className="text-sm text-muted-foreground">{copy.certId}</span>
                    <p className="font-mono text-sm font-medium text-foreground">{result.certId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            {result.valid && (
              <Button asChild className="min-h-[44px]">
                <a
                  href={`/api/certificate/${token}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.downloadPdf}
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link href={routes.marketing.landing}>{copy.verifyAnother}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
