import { FormSkeleton } from '@/components/skeletons/PageSkeletons';

export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2 border-b border-border pb-4">
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <FormSkeleton fields={4} />
      <FormSkeleton fields={4} />
    </div>
  );
}
