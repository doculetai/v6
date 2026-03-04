import { CardGridSkeleton, FormSkeleton, TableSkeleton } from '@/components/skeletons';
import { PageHeader } from '@/components/ui/page-header';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function SponsorDisbursementsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={sponsorCopy.disbursements.title}
        subtitle={sponsorCopy.disbursements.states.loading}
      />

      <CardGridSkeleton count={4} columns={4} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <TableSkeleton rows={6} columns={5} />
        <div className="space-y-4">
          <FormSkeleton fields={5} />
          <div className="rounded-xl border border-border bg-card p-4">
            <FormSkeleton fields={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
