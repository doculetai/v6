import { CheckCircle2, CircleDashed, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { studentCopy } from '@/config/copy/student';

type ProofChecklist = {
  kycComplete: boolean;
  schoolComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  completedCount: number;
  totalCount: number;
  requiresSponsor: boolean;
};

type ProofChecklistCardProps = {
  checklist: ProofChecklist;
};

export function ProofChecklistCard({ checklist }: ProofChecklistCardProps) {
  const progressLabel = studentCopy.proof.progress.progressLabel
    .replace('{completed}', String(checklist.completedCount))
    .replace('{total}', String(checklist.totalCount));

  const progressValue = (checklist.completedCount / checklist.totalCount) * 100;

  return (
    <Card className="relative overflow-hidden border-border bg-card/80 shadow-md backdrop-blur-sm dark:border-border dark:bg-card/80">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
      />

      <CardHeader className="relative space-y-3">
        <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-4 text-sm font-medium text-foreground dark:border-border dark:bg-background/80 dark:text-foreground">
          <ShieldCheck className="size-5 text-primary dark:text-primary" aria-hidden="true" />
          <span>{studentCopy.proof.progress.title}</span>
        </div>
        <CardTitle className="text-2xl text-card-foreground dark:text-card-foreground md:text-3xl">
          {progressLabel}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {studentCopy.proof.progress.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-5">
        <Progress
          value={progressValue}
          className="h-2 bg-muted dark:bg-muted [&_[data-slot=progress-indicator]]:duration-300"
        />

        <ul className="space-y-3" aria-label={studentCopy.proof.progress.title}>
          <ChecklistItem
            complete={checklist.kycComplete}
            label={studentCopy.proof.progress.items.kyc.label}
            completeDetail={studentCopy.proof.progress.items.kyc.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.kyc.pendingDetail}
          />
          <ChecklistItem
            complete={checklist.schoolComplete}
            label={studentCopy.proof.progress.items.school.label}
            completeDetail={studentCopy.proof.progress.items.school.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.school.pendingDetail}
          />
          <ChecklistItem
            complete={checklist.bankComplete}
            label={studentCopy.proof.progress.items.bank.label}
            completeDetail={studentCopy.proof.progress.items.bank.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.bank.pendingDetail}
          />
          {checklist.requiresSponsor ? (
            <ChecklistItem
              complete={checklist.sponsorComplete}
              label={studentCopy.proof.progress.items.sponsor.label}
              completeDetail={studentCopy.proof.progress.items.sponsor.completeDetail}
              pendingDetail={studentCopy.proof.progress.items.sponsor.pendingDetail}
            />
          ) : null}
          <ChecklistItem
            complete={checklist.documentsComplete}
            label={studentCopy.proof.progress.items.documents.label}
            completeDetail={studentCopy.proof.progress.items.documents.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.documents.pendingDetail}
          />
        </ul>
      </CardContent>
    </Card>
  );
}

type ChecklistItemProps = {
  complete: boolean;
  label: string;
  completeDetail: string;
  pendingDetail: string;
};

function ChecklistItem({ complete, label, completeDetail, pendingDetail }: ChecklistItemProps) {
  return (
    <li className="min-h-11 rounded-lg border border-border bg-background/70 p-3 transition-colors duration-150 dark:border-border dark:bg-background/70">
      <div className="flex items-start gap-3">
        {complete ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary dark:text-primary" aria-hidden="true" />
        ) : (
          <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground dark:text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {complete ? completeDetail : pendingDetail}
          </p>
        </div>
      </div>
    </li>
  );
}
