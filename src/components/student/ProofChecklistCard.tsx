'use client';

import { ArrowRight, CheckCircle, CircleDashed, ShieldCheck } from '@/components/icons';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';

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
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-3">
        <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-4 text-sm font-medium text-foreground">
          <ShieldCheck weight="duotone" className="size-5 text-primary" aria-hidden="true" />
          <span>{studentCopy.proof.progress.title}</span>
        </div>
        <CardTitle className="text-2xl text-card-foreground md:text-3xl">
          {progressLabel}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground md:text-base">
          {studentCopy.proof.progress.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Progress
          value={progressValue}
          className="h-2 bg-muted [&_[data-slot=progress-indicator]]:duration-300"
        />

        <ul className="space-y-3" aria-label={studentCopy.proof.progress.title}>
          <ChecklistItem
            complete={checklist.kycComplete}
            label={studentCopy.proof.progress.items.kyc.label}
            completeDetail={studentCopy.proof.progress.items.kyc.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.kyc.pendingDetail}
            href={studentCopy.proof.progress.items.kyc.pendingHref}
          />
          <ChecklistItem
            complete={checklist.schoolComplete}
            label={studentCopy.proof.progress.items.school.label}
            completeDetail={studentCopy.proof.progress.items.school.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.school.pendingDetail}
            href={studentCopy.proof.progress.items.school.pendingHref}
          />
          <ChecklistItem
            complete={checklist.bankComplete}
            label={studentCopy.proof.progress.items.bank.label}
            completeDetail={studentCopy.proof.progress.items.bank.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.bank.pendingDetail}
            href={studentCopy.proof.progress.items.bank.pendingHref}
          />
          {checklist.requiresSponsor ? (
            <ChecklistItem
              complete={checklist.sponsorComplete}
              label={studentCopy.proof.progress.items.sponsor.label}
              completeDetail={studentCopy.proof.progress.items.sponsor.completeDetail}
              pendingDetail={studentCopy.proof.progress.items.sponsor.pendingDetail}
              href={studentCopy.proof.progress.items.sponsor.pendingHref}
            />
          ) : null}
          <ChecklistItem
            complete={checklist.documentsComplete}
            label={studentCopy.proof.progress.items.documents.label}
            completeDetail={studentCopy.proof.progress.items.documents.completeDetail}
            pendingDetail={studentCopy.proof.progress.items.documents.pendingDetail}
            href={studentCopy.proof.progress.items.documents.pendingHref}
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
  href?: string;
};

function ChecklistItem({ complete, label, completeDetail, pendingDetail, href }: ChecklistItemProps) {
  const showLink = !complete && href;

  const content = (
    <div className="flex items-start gap-3">
      {complete ? (
        <CheckCircle weight="duotone" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <CircleDashed weight="duotone" className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {complete ? completeDetail : pendingDetail}
        </p>
      </div>

      {showLink ? (
        <ArrowRight weight="bold" className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      ) : null}
    </div>
  );

  return (
    <li className={cn(
      "min-h-11 rounded-lg border border-border bg-background/70 transition-all duration-150",
      showLink && "hover:shadow-sm hover:border-primary/20",
    )}>
      {showLink ? (
        <Link
          href={href}
          className="block p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      ) : (
        <div className="p-3">{content}</div>
      )}
    </li>
  );
}
