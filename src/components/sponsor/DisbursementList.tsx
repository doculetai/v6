import { FilterBar } from '@/components/ui/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { sponsorCopy } from '@/config/copy/sponsor';

import { DisbursementCard } from './DisbursementCard';
import type {
  DisbursementFilter,
  SponsorDisbursement,
} from './disbursement-types';

type DisbursementListProps = {
  disbursements: SponsorDisbursement[];
  activeFilter: DisbursementFilter;
  query: string;
  cancellingDisbursementId?: string | null;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: DisbursementFilter) => void;
  onCancel: (disbursementId: string) => void;
};

function isPendingStatus(status: SponsorDisbursement['status']) {
  return status === 'pending' || status === 'processing';
}

function matchesFilter(disbursement: SponsorDisbursement, filter: DisbursementFilter) {
  if (filter === 'all') return true;
  if (filter === 'pending') return isPendingStatus(disbursement.status);
  return disbursement.status === filter;
}

export function DisbursementList({
  disbursements,
  activeFilter,
  query,
  cancellingDisbursementId,
  onQueryChange,
  onFilterChange,
  onCancel,
}: DisbursementListProps) {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredDisbursements = disbursements.filter((disbursement) => {
    const queryMatches =
      !normalizedQuery ||
      disbursement.studentDisplayName.toLowerCase().includes(normalizedQuery) ||
      disbursement.studentEmail.toLowerCase().includes(normalizedQuery) ||
      (disbursement.paystackReference ?? '').toLowerCase().includes(normalizedQuery);

    return queryMatches && matchesFilter(disbursement, activeFilter);
  });

  const pendingCount = disbursements.filter((item) => isPendingStatus(item.status)).length;
  const completedCount = disbursements.filter((item) => item.status === 'completed').length;
  const failedCount = disbursements.filter((item) => item.status === 'failed').length;

  return (
    <section className="space-y-4">
      <FilterBar
        query={query}
        queryPlaceholder={sponsorCopy.disbursements.filters.queryPlaceholder}
        activeChip={activeFilter}
        onQueryChange={onQueryChange}
        onChipChange={(chip) => onFilterChange(chip as DisbursementFilter)}
        chips={[
          {
            key: 'all',
            label: sponsorCopy.disbursements.filters.all,
            count: disbursements.length,
          },
          {
            key: 'pending',
            label: sponsorCopy.disbursements.filters.pending,
            count: pendingCount,
          },
          {
            key: 'completed',
            label: sponsorCopy.disbursements.filters.completed,
            count: completedCount,
          },
          {
            key: 'failed',
            label: sponsorCopy.disbursements.filters.failed,
            count: failedCount,
          },
        ]}
        className="bg-card/95 dark:bg-card/90"
      />

      {filteredDisbursements.length === 0 ? (
        <EmptyState
          heading={sponsorCopy.disbursements.empty.title}
          body={sponsorCopy.disbursements.empty.description}
          className="rounded-xl border border-border/70 bg-card/95 dark:bg-card/90"
        />
      ) : null}

      {filteredDisbursements.length > 0 ? (
        <>
          <div className="space-y-3 lg:hidden">
            {filteredDisbursements.map((disbursement) => (
              <DisbursementCard
                key={disbursement.id}
                disbursement={disbursement}
                isCancelling={cancellingDisbursementId === disbursement.id}
                onCancel={onCancel}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card/95 dark:bg-card/90 lg:block">
            <div className="grid grid-cols-[1.35fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-border/70 bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground">
              <p>{sponsorCopy.disbursements.table.student}</p>
              <p>{sponsorCopy.disbursements.table.amount}</p>
              <p>{sponsorCopy.disbursements.table.scheduledDate}</p>
              <p>{sponsorCopy.disbursements.table.status}</p>
              <p>{sponsorCopy.disbursements.table.reference}</p>
              <p className="text-right">{sponsorCopy.disbursements.actions.cancel}</p>
            </div>

            {filteredDisbursements.map((disbursement) => (
              <DisbursementCard
                key={disbursement.id}
                disbursement={disbursement}
                layout="row"
                isCancelling={cancellingDisbursementId === disbursement.id}
                onCancel={onCancel}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
