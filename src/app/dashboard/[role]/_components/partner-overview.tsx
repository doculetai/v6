import { FileStack, GraduationCap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { partnerCopy } from '@/config/copy/partner';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type PartnerOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export async function PartnerOverview({ email, caller }: PartnerOverviewProps) {
  const firstName = getFirstName(email);
  const [overviewResult] = await Promise.allSettled([caller.partner.getPartnerOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const copy = partnerCopy.dashboard.overview;

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description={copy.subtitle(overview?.organizationName ?? null)}
        />
        <Grid cols={{ sm: 3 }} gap="md">
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label={copy.stats.totalStudents.label}
          value={overview ? String(overview.totalStudents) : '—'}
          sub={copy.stats.totalStudents.sub}
          accent={Boolean(overview?.totalStudents)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
          label={copy.stats.verifiedStudents.label}
          value={overview ? String(overview.verifiedStudents) : '—'}
          sub={copy.stats.verifiedStudents.sub}
          accent={Boolean(overview?.verifiedStudents)}
        />
        <StatCard
          icon={<FileStack className="size-4.5" aria-hidden="true" />}
          label={copy.stats.activeApiKeys.label}
          value={overview ? String(overview.activeApiKeys) : '—'}
          sub={copy.stats.activeApiKeys.sub}
          accent={Boolean(overview?.activeApiKeys)}
        />
      </Grid>

      <Card className="border-border bg-card">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalStudents
              ? copy.summary.withStudents(overview.verifiedStudents, overview.totalStudents)
              : copy.summary.empty}
          </p>
        </CardContent>
        </Card>

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/partner/students">{copy.cta}</Link>
        </Button>
      </Section>
    </PageShell>
  );
}
