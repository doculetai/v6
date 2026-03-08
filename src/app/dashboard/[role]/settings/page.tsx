import { TRPCError } from '@trpc/server';
import { Warning } from '@/components/icons';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { PageHeader, PageShell, Section } from '@/components/layout/content-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminCopy } from '@/config/copy/admin';
import { agentCopy } from '@/config/copy/agent';
import { partnerCopy } from '@/config/copy/partner';
import { sponsorCopy } from '@/config/copy/sponsor';
import { studentCopy } from '@/config/copy/student';
import { universityCopy } from '@/config/copy/university';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { AdminSettingsPageClient } from './admin-settings-page-client';
import { PartnerSettingsPageClient } from './partner-settings-page-client';
import type { AgentSettings, SponsorSettings, UniversityProfile } from './settings-page-client';
import { SettingsPageClient } from './settings-page-client';
import type { StudentSettings } from './student-settings-forms';
import { StudentSettingsPageClient } from './student-settings-page-client';
import { routes } from '@/config/routes';

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

  // ── Admin branch ──────────────────────────────────────────────────────────
  if (role === 'admin') {
    return <AdminSettingsPageClient copy={adminCopy.settings} />;
  }

  let caller: Awaited<ReturnType<typeof api>>;
  try {
    caller = await api();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') redirect(routes.auth.login);
    throw error;
  }

  // ── Student branch ────────────────────────────────────────────────────────
  if (role === 'student') {
    let studentSettings: StudentSettings | null = null;

    try {
      studentSettings = await caller.student.getStudentSettings();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
        redirect(routes.auth.login);
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        redirect(`/dashboard/${role}`);
      }
    }

    if (!studentSettings) {
      return (
        <PageShell width="default">
          <Section>
            <PageHeader title={studentCopy.settings.title} />
            <Card className="border-border bg-card dark:border-border dark:bg-card">
              <CardHeader className="space-y-3">
                <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
                <CardTitle className="text-lg text-card-foreground">
                  {studentCopy.settings.errors.loadError}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="min-h-11">
                  <Link href={`/dashboard/${role}/settings`}>
                    {studentCopy.settings.errors.tryAgain}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Section>
        </PageShell>
      );
    }

    return <StudentSettingsPageClient settings={studentSettings} />;
  }

  // ── Partner branch ────────────────────────────────────────────────────────
  if (role === 'partner') {
    let partnerSettings: {
      organizationName: string;
      webhookUrl: string | null;
      brandColor: string | null;
      brandLogoUrl: string | null;
    } | null = null;

    try {
      partnerSettings = await caller.partner.getPartnerSettings();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') redirect(routes.auth.login);
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') redirect(`/dashboard/${role}`);
    }

    return <PartnerSettingsPageClient settings={partnerSettings} copy={partnerCopy.settings} />;
  }

  // ── Agent branch ─────────────────────────────────────────────────────────
  if (role === 'agent') {
    let settings: AgentSettings | null = null;

    try {
      settings = await caller.agent.getSettings();
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
        redirect(routes.auth.login);
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        redirect(`/dashboard/${role}`);
      }
    }

    if (!settings) {
      return (
        <PageShell width="default">
          <Section>
            <PageHeader title={agentCopy.settings.title} />
            <Card className="border-border bg-card dark:border-border dark:bg-card">
              <CardHeader className="space-y-3">
                <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
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
          </Section>
        </PageShell>
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
        redirect(routes.auth.login);
      }
      if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
        redirect(`/dashboard/${role}`);
      }
    }

    if (!uniProfile) {
      return (
        <PageShell width="default">
          <Section>
            <PageHeader title={universityCopy.settings.title} />
            <Card className="border-border bg-card dark:border-border dark:bg-card">
              <CardHeader className="space-y-3">
                <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
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
          </Section>
        </PageShell>
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
      redirect(routes.auth.login);
    }
    if (error instanceof TRPCError && error.code === 'FORBIDDEN') {
      redirect(`/dashboard/${role}`);
    }
  }

  if (!sponsorSettings) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={sponsorCopy.settings.title} />
          <Card className="border-border bg-card dark:border-border dark:bg-card">
            <CardHeader className="space-y-3">
              <Warning weight="duotone" className="size-5 text-destructive" aria-hidden="true" />
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
        </Section>
      </PageShell>
    );
  }

  return <SettingsPageClient role="sponsor" settings={sponsorSettings} />;
}
