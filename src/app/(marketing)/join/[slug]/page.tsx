import type { Metadata } from 'next';

import {
  Container,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.join.title} — Doculet`,
  description: marketingCopy.join.metaDescription,
  openGraph: {
    title: `${marketingCopy.join.title} — Doculet`,
    description: marketingCopy.join.metaDescription,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${marketingCopy.join.title} — Doculet`,
    description: marketingCopy.join.metaDescription,
  },
};

type JoinPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { slug } = await params;
  const { join } = marketingCopy;

  return (
    <PageShell width="narrow" className="py-8 md:py-12">
      <Section>
        <PageHeader title={join.title} description={join.subtitle} />
        <Container>
          <p className="text-muted-foreground">{join.earlyAccess}</p>
        </Container>
      </Section>
    </PageShell>
  );
}
