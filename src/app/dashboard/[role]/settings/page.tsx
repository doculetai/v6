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

import type { AgentSettings, SponsorSettings } from './settings-page-client';
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

  if (role !== 'agent' && role !== 'sponsor') {
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
              Unable to load settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/dashboard/${role}/settings`}>Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SettingsPageClient role="sponsor" settings={sponsorSettings} />;
}
