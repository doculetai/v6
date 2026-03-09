import { TRPCError } from '@trpc/server';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import { routes } from '@/config/routes';
import { api } from '@/trpc/server';

import { BrandingPageClient } from './branding-page-client';

type PageProps = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  if (role !== 'partner') return { title: 'Branding — Doculet' };
  return {
    title: `${partnerCopy.branding.title} — Doculet`,
    description: partnerCopy.branding.subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function BrandingPage({ params }: PageProps) {
  const { role } = await params;
  if (role !== 'partner') notFound();

  const caller = await api();
  try {
    await caller.dashboard.getSession({ role });
  } catch (e) {
    if (e instanceof TRPCError && e.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw e;
  }

  let branding = null;
  try {
    branding = await caller.partner.getPartnerBranding();
  } catch {
    // leave branding null — BrandingPageClient renders the error state
  }

  return <BrandingPageClient branding={branding} copy={partnerCopy.branding} />;
}
