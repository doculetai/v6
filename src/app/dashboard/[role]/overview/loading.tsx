import { DashboardOverviewSkeleton } from '@/components/skeletons/PageSkeletons';

export default function OverviewLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <DashboardOverviewSkeleton />
    </div>
  );
}
