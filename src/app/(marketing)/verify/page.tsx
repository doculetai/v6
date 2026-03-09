import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Container, PageHeader, PageShell, Section } from '@/components/layout/content-primitives';
import { marketingCopy } from '@/config/copy/marketing';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: `${marketingCopy.certificate.title} — Doculet`,
  description: marketingCopy.verify.metaDescription,
  openGraph: {
    title: `${marketingCopy.certificate.title} — Doculet`,
    description: marketingCopy.verify.metaDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${marketingCopy.certificate.title} — Doculet`,
    description: marketingCopy.verify.metaDescription,
  },
};

type VerifyPageProps = {
  searchParams: Promise<{ token?: string }>;
};

function normalizeToken(rawToken: string | undefined): string | null {
  if (!rawToken) {
    return null;
  }

  const trimmed = rawToken.trim();
  if (!trimmed) {
    return null;
  }

  const safeToken = trimmed.replace(/^\/+|\/+$/g, '');
  return safeToken.length > 0 ? safeToken : null;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const token = normalizeToken(params.token);
  const copy = marketingCopy.certificate;

  if (token) {
    redirect(routes.marketing.certificate(token));
  }

  return (
    <PageShell width="narrow" className="py-8 md:py-12">
      <Section>
        <PageHeader title={copy.title} description={copy.lookupDescription} />
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>{copy.title}</CardTitle>
              <CardDescription>{copy.lookupDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={routes.marketing.verify} method="get" className="flex flex-col gap-3 sm:flex-row">
                <Input
                  name="token"
                  placeholder={copy.lookupPlaceholder}
                  aria-label={copy.lookupPlaceholder}
                  required
                  className="h-11"
                />
                <Button type="submit" className="min-h-[44px]">{copy.lookupCta}</Button>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </PageShell>
  );
}
