import { FileStack, GraduationCap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {overview?.organizationName
            ? `${overview.organizationName} — integration performance at a glance.`
            : 'Monitor your integration performance.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label="Total Students"
          value={overview ? String(overview.totalStudents) : '—'}
          sub="enrolled via your integration"
          accent={Boolean(overview?.totalStudents)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
          label="Verified Students"
          value={overview ? String(overview.verifiedStudents) : '—'}
          sub="KYC complete"
          accent={Boolean(overview?.verifiedStudents)}
        />
        <StatCard
          icon={<FileStack className="size-4.5" aria-hidden="true" />}
          label="Active API Keys"
          value={overview ? String(overview.activeApiKeys) : '—'}
          sub="in use"
          accent={Boolean(overview?.activeApiKeys)}
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalStudents
              ? `${overview.verifiedStudents} of ${overview.totalStudents} students have completed KYC verification.`
              : 'No students enrolled yet. Use the API Keys page to get your integration started.'}
          </p>
        </CardContent>
      </Card>

      <Button asChild className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/partner/students">View students</Link>
      </Button>
    </section>
  );
}
