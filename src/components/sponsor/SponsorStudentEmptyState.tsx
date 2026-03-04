import { UserPlus, UsersRound } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { sponsorCopy } from '@/config/copy/sponsor';

type SponsorStudentEmptyStateProps = {
  onInvite: () => void;
};

function EmptyStateIllustration() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-border/70 bg-primary/10 shadow-sm dark:border-border/70 dark:bg-primary/15">
      <UsersRound className="size-12 text-primary dark:text-primary" aria-hidden="true" />
      <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm dark:border-border dark:bg-card dark:text-primary">
        <UserPlus className="size-5" aria-hidden="true" />
      </div>
    </div>
  );
}

export function SponsorStudentEmptyState({ onInvite }: SponsorStudentEmptyStateProps) {
  return (
    <EmptyState
      heading={sponsorCopy.students.empty.title}
      body={sponsorCopy.students.empty.description}
      action={{
        label: sponsorCopy.students.empty.cta,
        onClick: onInvite,
      }}
      illustration={<EmptyStateIllustration />}
      className="rounded-xl border border-dashed border-border/70 bg-card/50 dark:border-border/70 dark:bg-card/50"
    />
  );
}
