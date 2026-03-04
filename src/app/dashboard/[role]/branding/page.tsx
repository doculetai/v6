import type { Metadata } from 'next';
import type { inferRouterOutputs } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { notFound, redirect } from 'next/navigation';

import { partnerCopy } from '@/config/copy/partner';
import type { AppRouter } from '@/server/root';
import { api } from '@/trpc/server';

import { BrandingPageClient } from './branding-page-client';

export const metadata: Metadata = {
  title: partnerCopy.branding.title,
  description: partnerCopy.branding.subtitle,
};

type DashboardBrandingPageProps = {
  params: Promise<{ role: string }>;
};

type BrandingData = inferRouterOutputs<AppRouter>['partner']['getBranding'];

export default async function DashboardBrandingPage({ params }: DashboardBrandingPageProps) {
  const { role } = await params;

  if (role !== 'partner') {
    notFound();
  }

  const caller = await api();
  let initialData: BrandingData;

  try {
    initialData = await caller.partner.getBranding();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      redirect('/login');
    }

    throw new Error(partnerCopy.branding.states.errorTitle);
  }

  return <BrandingPageClient initialData={initialData} />;
}
