'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@/components/icons';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EmptyState,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import type { partnerCopy } from '@/config/copy/partner';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { formatNGN } from '@/lib/utils';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type Program = {
  id: string;
  name: string;
  tuitionAmount: number;
  currency: string;
  durationMonths: number;
  schoolName: string;
  schoolCountry: string;
};

type Copy = typeof partnerCopy.programs;

type PartnerProgramsPageClientProps = {
  programs: Program[];
  copy: Copy;
};

// ── Table (desktop) ───────────────────────────────────────────────────────────

function ProgramsTable({
  programs,
  copy,
}: {
  programs: Program[];
  copy: Copy;
}) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.university}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.program}
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              {copy.table.tuition}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.duration}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.country}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {programs.map((program) => (
            <tr
              key={program.id}
              className="bg-card transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {program.schoolName}
              </td>
              <td className="px-4 py-3 text-foreground">
                {program.name}
              </td>
              <td className="px-4 py-3 text-right font-mono text-foreground">
                {program.currency === 'NGN'
                  ? formatNGN(program.tuitionAmount)
                  : `${program.currency} ${program.tuitionAmount.toLocaleString()}`}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {copy.durationLabel(program.durationMonths)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {program.schoolCountry}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Cards (mobile) ────────────────────────────────────────────────────────────

function ProgramCards({
  programs,
  copy,
}: {
  programs: Program[];
  copy: Copy;
}) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {programs.map((program) => (
        <Card key={program.id} className="border-border bg-card">
          <CardContent className="space-y-2 pt-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                {program.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {program.schoolName} — {program.schoolCountry}
              </p>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-mono">
                {program.currency === 'NGN'
                  ? formatNGN(program.tuitionAmount)
                  : `${program.currency} ${program.tuitionAmount.toLocaleString()}`}
              </span>
              <span>{copy.durationLabel(program.durationMonths)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PartnerProgramsPageClient({
  programs,
  copy,
}: PartnerProgramsPageClientProps) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const [search, setSearch] = useState('');

  const filtered = programs.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.schoolName.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    );
  });

  if (programs.length === 0) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={routes.dashboard.partner.overview}>{copy.empty.action}</Link>
              </Button>
            }
          />
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />

        <div className="relative max-w-sm">
          <MagnifyingGlass
            weight="duotone"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            onReset={() => setSearch('')}
          />
        ) : (
          <>
            <ProgramsTable programs={filtered} copy={copy} />
            <ProgramCards programs={filtered} copy={copy} />
          </>
        )}
      </Section>
    </PageShell>
  );
}
