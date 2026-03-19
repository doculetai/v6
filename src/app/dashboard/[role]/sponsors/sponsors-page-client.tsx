'use client';

import { CurrencyNgn, Users } from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import type { agentCopy } from '@/config/copy/agent';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentSponsor = {
  sponsorId: string;
  sponsorEmail: string | null;
  studentsCount: number;
  totalFundedKobo: number;
  joinedAt: Date;
};

type Props = {
  sponsors: AgentSponsor[];
  copy: typeof agentCopy.sponsors;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function SponsorCard({ sponsor, copy }: { sponsor: AgentSponsor; copy: Props['copy'] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="truncate text-sm font-medium text-foreground">
        {sponsor.sponsorEmail ?? '—'}
      </p>

      {/* layout-audit-disable: dl requires semantic element for dt/dd */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.studentsCount}</dt>
          <dd className="flex items-center gap-1 text-foreground">
            <Users weight="duotone" size={16} className="text-muted-foreground" />
            <span className="tabular-nums">{sponsor.studentsCount}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.totalFundedKobo}</dt>
          <dd className="flex items-center gap-1 text-foreground">
            <CurrencyNgn weight="duotone" size={16} className="text-muted-foreground" />
            <span className="tabular-nums font-mono text-xs">
              {formatNaira(sponsor.totalFundedKobo)}
            </span>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">{copy.table.joinedAt}</dt>
          <dd className="text-muted-foreground">{formatDate(sponsor.joinedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SponsorsPageClient({ sponsors, copy }: Props) {
  if (sponsors.length === 0) {
    return (
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
        action={{ label: copy.empty.action, href: routes.dashboard.agent.bulkInvite }}
      />
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.sponsorId} sponsor={sponsor} copy={copy} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.email}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.studentsCount}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.totalFundedKobo}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.joinedAt}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sponsors.map((sponsor) => (
              <tr
                key={sponsor.sponsorId}
                className="bg-card transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-foreground">
                  {sponsor.sponsorEmail ?? '—'}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {sponsor.studentsCount}
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {formatNaira(sponsor.totalFundedKobo)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(sponsor.joinedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
