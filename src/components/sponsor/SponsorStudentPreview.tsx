import { GraduationCap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/status-badge';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

type SponsorStudentStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'certificate_issued'
  | 'rejected'
  | 'action_required'
  | 'expired';

type SponsorStudentPreviewItem = {
  id: string;
  name: string;
  universityName: string | null;
  tier: 1 | 2 | 3;
  status: SponsorStudentStatus;
};

type SponsorStudentPreviewProps = {
  students: SponsorStudentPreviewItem[];
  loading?: boolean;
  className?: string;
};

function getTierBadge(tier: 1 | 2 | 3) {
  if (tier === 3) {
    return (
      <span className="inline-flex items-center gap-2">
        <StatusBadge status="verified" label={`${sponsorCopy.overview.studentPreview.tierLabelPrefix} 3`} />
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </span>
    );
  }

  if (tier === 2) {
    return (
      <StatusBadge
        status="verified"
        label={`${sponsorCopy.overview.studentPreview.tierLabelPrefix} 2`}
        className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      />
    );
  }

  return <StatusBadge status="pending" label={`${sponsorCopy.overview.studentPreview.tierLabelPrefix} 1`} />;
}

function getStatusBadgeVariant(status: SponsorStudentStatus): StatusBadgeStatus {
  if (status === 'approved' || status === 'certificate_issued') {
    return 'verified';
  }

  if (status === 'rejected') {
    return 'rejected';
  }

  if (status === 'action_required') {
    return 'attention';
  }

  if (status === 'expired') {
    return 'expired';
  }

  return 'pending';
}

function getStatusLabel(status: SponsorStudentStatus): string {
  const labels = sponsorCopy.overview.studentPreview.statusLabels;

  if (status === 'draft') return labels.draft;
  if (status === 'submitted') return labels.submitted;
  if (status === 'under_review') return labels.underReview;
  if (status === 'approved') return labels.approved;
  if (status === 'certificate_issued') return labels.certificateIssued;
  if (status === 'rejected') return labels.rejected;
  if (status === 'action_required') return labels.actionRequired;
  return labels.expired;
}

function StudentPreviewSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`student-preview-skeleton-${index}`} className="rounded-xl border bg-card p-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted/70" />
          <div className="mt-3 h-6 w-28 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

function SponsorStudentPreview({ students, loading = false, className }: SponsorStudentPreviewProps) {
  const copy = sponsorCopy.overview.studentPreview;
  const previewStudents = students.slice(0, 2);

  return (
    <Card className={cn('border-border bg-card dark:border-border dark:bg-card', className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-card-foreground dark:text-card-foreground md:text-xl">
          {copy.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? <StudentPreviewSkeleton /> : null}

        {!loading && previewStudents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-4 dark:border-border/60 dark:bg-background/40">
            <GraduationCap className="size-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground dark:text-foreground">
              {copy.empty.heading}
            </p>
            <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
              {copy.empty.description}
            </p>
            <Button asChild className="mt-4 min-h-11 w-full sm:w-auto">
              <Link href="/dashboard/sponsor/students">{copy.empty.cta}</Link>
            </Button>
          </div>
        ) : null}

        {!loading && previewStudents.length > 0 ? (
          <ul className="space-y-3">
            {previewStudents.map((student) => (
              <li
                key={student.id}
                className="rounded-xl border border-border/80 bg-background/60 p-3 dark:border-border/60 dark:bg-background/40"
              >
                <p className="text-sm font-semibold text-foreground dark:text-foreground">{student.name}</p>
                <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
                  {student.universityName ?? copy.universityFallback}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {getTierBadge(student.tier)}
                  <StatusBadge
                    status={getStatusBadgeVariant(student.status)}
                    label={getStatusLabel(student.status)}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
          <Link href="/dashboard/sponsor/students">{copy.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export { SponsorStudentPreview };
export type { SponsorStudentPreviewItem, SponsorStudentPreviewProps, SponsorStudentStatus };
