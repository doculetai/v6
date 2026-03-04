import type { Metadata } from 'next';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { BrandingPageClient } from './branding-page-client';

export const metadata: Metadata = { title: partnerCopy.branding.title };

type PageProps = { params: Promise<{ role: string }> };

export default async function BrandingPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    return <p className="text-muted-foreground">{partnerCopy.errors.unauthorized}</p>;
  }

  let branding: Awaited<ReturnType<Awaited<ReturnType<typeof api>>['partner']['getPartnerBranding']>> | null = null;
  try {
    const caller = await api();
    branding = await caller.partner.getPartnerBranding();
  } catch {
    branding = null;
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{partnerCopy.branding.title}</h1>
      <BrandingPageClient branding={branding} copy={partnerCopy.branding} />
    </div>
  );
}
