import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { BrandingPageClient } from './branding-page-client';
import { routes } from '@/config/routes';

export const metadata: Metadata = { title: partnerCopy.branding.title };

type PageProps = { params: Promise<{ role: string }> };

export default async function BrandingPage({ params }: PageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    notFound();
  }

  const caller = await api();

  const [brandingResult] = await Promise.allSettled([caller.partner.getPartnerBranding()]);
  if (brandingResult.status === 'rejected') {
    const err = brandingResult.reason;
    if (err instanceof TRPCError && err.code === 'UNAUTHORIZED') redirect(routes.auth.login);
  }
  const branding = brandingResult.status === 'fulfilled' ? brandingResult.value : null;

  return <BrandingPageClient branding={branding} copy={partnerCopy.branding} />;
}
