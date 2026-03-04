import { TRPCError } from '@trpc/server';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { agentCopy } from '@/config/copy/agent';
import { sponsorCopy } from '@/config/copy/sponsor';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { universityCopy } from '@/config/copy/university';

import type { AgentSettings, SponsorSettings, UniversityProfile } from './settings-page-client';
import { SettingsPageClient } from './settings-page-client';

export const metadata = {
  title: 'Settings — Doculet.ai',
};

type SettingsPageProps = {
  params: Promise<{ role: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  if (role !== 'agent' && role !== 'sponsor' && role !== 'university') {
    redirect(`/dashboard/${role}`);
  }

  const caller = await api();

  // ── Agent branch ─────────────────────────────────────────────────────────
  if (role === 'agent') {
    let settings: AgentSettings | null = null;

    try {
      settings = await caller.agent.getSettings();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
        redirect('/login');
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        redirect(`/dashboard/${role}`);
      }
    }

    if (!settings) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="sr-only">{agentCopy.settings.title}</h1>
          <Card className="border-border bg-card dark:border-border dark:bg-card">
            <CardHeader className="space-y-3">
              <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
              <CardTitle className="text-lg text-card-foreground">
                {agentCopy.settings.errors.loadError}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="min-h-11">
                <Link href={`/dashboard/${role}/settings`}>
                  {agentCopy.settings.errors.tryAgain}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <SettingsPageClient role="agent" settings={settings} />;
  }

  // ── University branch ─────────────────────────────────────────────────────
  if (role === 'university') {
    let uniProfile: UniversityProfile | null = null;

    try {
      uniProfile = await caller.university.getUniversityProfile();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
        redirect('/login');
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        redirect(`/dashboard/${role}`);
      }
    }

    if (!uniProfile) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="sr-only">{universityCopy.settings.title}</h1>
          <Card className="border-border bg-card dark:border-border dark:bg-card">
            <CardHeader className="space-y-3">
              <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
              <CardTitle className="text-lg text-card-foreground">
                {universityCopy.settings.errors.loadError}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="min-h-11">
                <Link href={`/dashboard/${role}/settings`}>
                  {universityCopy.settings.errors.tryAgain}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <SettingsPageClient role="university" profile={uniProfile} />;
  }

  // ── Sponsor branch ───────────────────────────────────────────────────────
  let sponsorSettings: SponsorSettings | null = null;

  try {
    sponsorSettings = await caller.sponsor.getSponsorSettings();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      redirect(`/dashboard/${role}`);
    }
  }

  if (!sponsorSettings) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="sr-only">{sponsorCopy.settings.title}</h1>
        <Card className="border-border bg-card dark:border-border dark:bg-card">
          <CardHeader className="space-y-3">
            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-lg text-card-foreground">
              {sponsorCopy.settings.errors.loadError}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/dashboard/${role}/settings`}>
                {sponsorCopy.settings.errors.tryAgain}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SettingsPageClient role="sponsor" settings={sponsorSettings} />;
}
