'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlass, X } from '@/components/icons';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EmptyState,
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { Card, CardContent } from '@/components/ui/card';
import type { partnerCopy } from '@/config/copy/partner';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn } from '@/lib/utils';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type PartnerStudent = {
  id: string;
  studentId: string;
  tier: number;
  verifiedAt: Date;
  schoolName: string | null;
};

type Copy = typeof partnerCopy.applications;

type ApplicationsPageClientProps = {
  initialStudents: PartnerStudent[];
  copy: Copy;
};

type StatusKey = 'all' | 'pending' | 'active' | 'completed';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusKey(tier: number): Exclude<StatusKey, 'all'> {
  if (tier >= 3) return 'completed';
  if (tier >= 2) return 'active';
  return 'pending';
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Status badge ──────────────────────────────────────────────────────────────

function ApplicationStatusBadge({ tier, copy }: { tier: number; copy: Copy }) {
  const status = getStatusKey(tier);
  const label = copy.statusLabels[status] ?? status;
  const badgeClass =
    status === 'completed'
      ? 'bg-primary/10 text-primary border-0'
      : status === 'active'
        ? 'bg-success/10 text-success border-0'
        : 'bg-muted text-muted-foreground border-0';

  return <Badge className={badgeClass}>{label}</Badge>;
}

// ── Filter tabs ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: StatusKey[] = ['all', 'pending', 'active', 'completed'];

function FilterTabs({
  active,
  onChange,
  counts,
  copy,
}: {
  active: StatusKey;
  onChange: (status: StatusKey) => void;
  counts: Record<StatusKey, number>;
  copy: Copy;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto" role="tablist">
      {STATUS_FILTERS.map((status) => {
        const label = status === 'all' ? copy.filterAll : (copy.statusLabels[status] ?? status);
        const isActive = active === status;
        return (
          <button
            key={status}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(status)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {label}
            <span
              className={cn(
                'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums',
                isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {counts[status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Detail sheet ─────────────────────────────────────────────────────────────

function ApplicationDetail({
  student,
  copy,
  onClose,
}: {
  student: PartnerStudent;
  copy: Copy;
  onClose: () => void;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {copy.detail.title}
          </p>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="size-4" weight="duotone" aria-hidden="true" />
            <span className="sr-only">{copy.detail.closeLabel}</span>
          </Button>
        </div>
        <Grid cols={{ sm: 2 }} gap="md" className="mt-4">
          <div>
            <p className="text-xs text-muted-foreground">{copy.detail.studentLabel}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{student.studentId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{copy.detail.programLabel}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {student.schoolName ?? '\u2014'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{copy.detail.statusLabel}</p>
            <div className="mt-1">
              <ApplicationStatusBadge tier={student.tier} copy={copy} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{copy.detail.submittedLabel}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {formatDate(student.verifiedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{copy.detail.tierLabel}</p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
              Tier {student.tier}
            </p>
          </div>
        </Grid>
      </CardContent>
    </Card>
  );
}

// ── Table (desktop) ───────────────────────────────────────────────────────────

function ApplicationsTable({
  students,
  copy,
  selectedId,
  onSelect,
}: {
  students: PartnerStudent[];
  copy: Copy;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.student}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.status}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.program}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.submitted}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr
              key={student.id}
              onClick={() => onSelect(student.id)}
              className={cn(
                'cursor-pointer bg-card transition-colors hover:bg-muted/30',
                selectedId === student.id && 'bg-primary/5',
              )}
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {student.studentId.slice(0, 8)}...
              </td>
              <td className="px-4 py-3">
                <ApplicationStatusBadge tier={student.tier} copy={copy} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {student.schoolName ?? '\u2014'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(student.verifiedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Cards (mobile) ────────────────────────────────────────────────────────────

function ApplicationCards({
  students,
  copy,
  selectedId,
  onSelect,
}: {
  students: PartnerStudent[];
  copy: Copy;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Stack gap="sm" className="sm:hidden">
      {students.map((student) => (
        <Card
          key={student.id}
          className={cn(
            'cursor-pointer border-border bg-card transition-colors hover:bg-muted/30',
            selectedId === student.id && 'border-primary/30 bg-primary/5',
          )}
          onClick={() => onSelect(student.id)}
        >
          <CardContent className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {student.studentId.slice(0, 8)}...
              </p>
              <ApplicationStatusBadge tier={student.tier} copy={copy} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{copy.table.program}: {student.schoolName ?? '\u2014'}</span>
              <span>{formatDate(student.verifiedAt)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ApplicationsPageClient({
  initialStudents,
  copy,
}: ApplicationsPageClientProps) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<StatusKey, number> = { all: initialStudents.length, pending: 0, active: 0, completed: 0 };
    for (const s of initialStudents) {
      c[getStatusKey(s.tier)]++;
    }
    return c;
  }, [initialStudents]);

  const filtered = useMemo(() => {
    return initialStudents.filter((s) => {
      if (statusFilter !== 'all' && getStatusKey(s.tier) !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.studentId.toLowerCase().includes(q) ||
        (s.schoolName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [initialStudents, statusFilter, search]);

  const selectedStudent = selectedId
    ? initialStudents.find((s) => s.id === selectedId) ?? null
    : null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  if (initialStudents.length === 0) {
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

        <Stack gap="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs
              active={statusFilter}
              onChange={setStatusFilter}
              counts={counts}
              copy={copy}
            />
            <div className="relative max-w-sm flex-1 sm:max-w-xs">
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
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={copy.noFilterResults}
              description={copy.empty.description}
              onReset={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            />
          ) : (
            <>
              <ApplicationsTable
                students={filtered}
                copy={copy}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
              <ApplicationCards
                students={filtered}
                copy={copy}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </>
          )}

          {selectedStudent ? (
            <ApplicationDetail
              student={selectedStudent}
              copy={copy}
              onClose={() => setSelectedId(null)}
            />
          ) : null}
        </Stack>
      </Section>
    </PageShell>
  );
}
