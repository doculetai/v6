import { CardGridSkeleton } from '@/components/skeletons';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function SponsorStudentsLoading() {
  return (
    <section aria-label={sponsorCopy.students.loading.ariaLabel} className="space-y-4">
      <CardGridSkeleton count={4} columns={2} />
    </section>
  );
}
