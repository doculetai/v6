'use client';

import { useState } from 'react';

import {
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  Funnel,
} from '@/components/icons';

import { Stack } from '@/components/layout/content-primitives';
import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  meta: unknown;
  ip: string | null;
  actorEmail: string | null;
  createdAt: Date;
};

type InitialData = {
  rows: AuditRow[];
  total: number;
};

interface AuditPageClientProps {
  initialData: InitialData | null;
}

const PAGE_SIZE = 50;

function formatMeta(meta: unknown): string {
  if (!meta || typeof meta !== 'object') return '';
  try {
    return JSON.stringify(meta, null, 0).slice(0, 120);
  } catch {
    return '';
  }
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditPageClient({ initialData }: AuditPageClientProps) {
  const copy = adminCopy.audit;
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const { data, isLoading, isError } = trpc.adminAudit.listAuditLog.useQuery(
    {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      action: actionFilter || undefined,
      entityType: entityTypeFilter || undefined,
    },
    {
      initialData: page === 0 && !actionFilter && !entityTypeFilter
        ? (initialData ?? undefined)
        : undefined,
    },
  );

  if (isError || (!isLoading && !data && initialData === null)) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{copy.error.description}</p>
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const from = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * PAGE_SIZE, total);
  const hasNext = to < total;
  const hasPrev = page > 0;

  return (
    <Stack gap="md">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <Funnel className="size-5 text-muted-foreground" weight="duotone" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <label htmlFor="audit-action-filter" className="text-xs text-muted-foreground">
            {copy.filters.action}
          </label>
          <input
            id="audit-action-filter"
            type="text"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="min-h-[44px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={copy.filters.action}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="audit-entity-filter" className="text-xs text-muted-foreground">
            {copy.filters.entityType}
          </label>
          <input
            id="audit-entity-filter"
            type="text"
            value={entityTypeFilter}
            onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); }}
            className="min-h-[44px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={copy.filters.entityType}
          />
        </div>
        {(actionFilter || entityTypeFilter) && (
          <button
            type="button"
            onClick={() => { setActionFilter(''); setEntityTypeFilter(''); setPage(0); }}
            className="min-h-[44px] rounded-md px-3 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.filters.clear}
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
          <ClockCounterClockwise className="size-10 text-primary" weight="duotone" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{copy.empty.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{copy.empty.description}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && rows.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.timestamp}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.action}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.entityType}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.actor}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.table.details}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatTimestamp(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                      {row.action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                      {row.entityType}
                      {row.entityId ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({row.entityId.slice(0, 8)})
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {row.actorEmail ?? '—'}
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatMeta(row.meta) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul role="list" className="space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{row.action}</p>
                  <span className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                    {row.entityType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{row.actorEmail ?? '—'}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatTimestamp(row.createdAt)}
                </p>
                {formatMeta(row.meta) ? (
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {formatMeta(row.meta)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {copy.pagination.showing(from, to, total)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CaretLeft className="size-4" weight="duotone" aria-hidden="true" />
                {copy.pagination.previous}
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copy.pagination.next}
                <CaretRight className="size-4" weight="duotone" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </Stack>
  );
}
