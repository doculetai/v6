import { GraduationCap, ShieldCheck, Trash2, University } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MoneyValue } from '@/components/ui/money-value';
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/status-badge';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

export type SponsorStudentCardItem = {
  sponsorshipId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentInitials: string;
  universityName: string;
  programName: string;
  fundingAmountKobo: number;
  currency: string;
  tier: 1 | 2 | 3;
  status: 'pending' | 'active' | 'completed';
  updatedAt: Date;
};

type SponsorStudentCardProps = {
  student: SponsorStudentCardItem;
  isRemoving: boolean;
  onRemove: (sponsorshipId: string) => void;
};

function getTierStyles(tier: SponsorStudentCardItem['tier']) {
  if (tier === 3) {
    return {
      className: 'bg-success/15 text-success dark:bg-success/20 dark:text-success',
      label: sponsorCopy.students.tier.tier3,
      showShield: true,
    };
  }

  if (tier === 2) {
    return {
      className: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
      label: sponsorCopy.students.tier.tier2,
      showShield: false,
    };
  }

  return {
    className: 'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground',
    label: sponsorCopy.students.tier.tier1,
    showShield: false,
  };
}

function getStatusBadgeStatus(status: SponsorStudentCardItem['status']): StatusBadgeStatus {
  if (status === 'active') {
    return 'verified';
  }

  if (status === 'completed') {
    return 'attention';
  }

  return 'pending';
}

function formatWATTimestamp(updatedAt: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(updatedAt));
}

export function SponsorStudentCard({ student, isRemoving, onRemove }: SponsorStudentCardProps) {
  const tierStyle = getTierStyles(student.tier);

  return (
    <Card className="border-border/70 bg-card/80 text-card-foreground shadow-sm backdrop-blur-sm dark:border-border dark:bg-card/80">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg" className="border border-border/70 dark:border-border/70">
              <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                {student.studentInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold text-card-foreground dark:text-card-foreground">
                {student.studentName}
              </p>
              <p className="truncate text-sm text-muted-foreground dark:text-muted-foreground">
                {student.studentEmail}
              </p>
            </div>
          </div>

          <StatusBadge
            status={getStatusBadgeStatus(student.status)}
            size="sm"
            label={sponsorCopy.students.status[student.status]}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              tierStyle.className,
            )}
            aria-label={`${sponsorCopy.students.tier.label} ${student.tier}`}
          >
            {tierStyle.showShield ? <ShieldCheck className="size-4" aria-hidden="true" /> : null}
            {tierStyle.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="space-y-3">
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
              {sponsorCopy.students.card.universityLabel}
            </dt>
            <dd className="inline-flex items-center gap-2 text-sm text-card-foreground dark:text-card-foreground">
              <University className="size-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
              {student.universityName}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
              {sponsorCopy.students.card.programLabel}
            </dt>
            <dd className="inline-flex items-center gap-2 text-sm text-card-foreground dark:text-card-foreground">
              <GraduationCap className="size-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
              {student.programName}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
              {sponsorCopy.students.card.fundingLabel}
            </dt>
            <dd className="inline-flex items-baseline gap-1 text-lg font-semibold text-card-foreground dark:text-card-foreground">
              <span aria-hidden="true">{sponsorCopy.students.currencySymbol}</span>
              <MoneyValue
                amountMinor={student.fundingAmountKobo}
                showCode={false}
                className="text-lg font-semibold"
              />
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
              {sponsorCopy.students.card.updatedLabel}
            </dt>
            <dd className="text-sm text-card-foreground dark:text-card-foreground">
              {formatWATTimestamp(student.updatedAt)}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          onClick={() => onRemove(student.sponsorshipId)}
          disabled={isRemoving}
        >
          <Trash2 className="size-5" aria-hidden="true" />
          {isRemoving
            ? sponsorCopy.students.card.removePendingLabel
            : sponsorCopy.students.card.removeCta}
        </Button>
      </CardContent>
    </Card>
  );
}
