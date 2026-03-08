'use client';

import { Certificate, IdentificationCard, Money, UserCheck } from '@phosphor-icons/react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { adminCopy } from '@/config/copy/admin';
import { formatDocumentType, formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';

type StudentRecordDrawerProps = {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DocumentStatusMap = Record<string, 'pending' | 'verified' | 'rejected' | 'attention' | 'expired'>;

const docStatusToBadge: DocumentStatusMap = {
  pending: 'pending',
  approved: 'verified',
  rejected: 'rejected',
  more_info_requested: 'attention',
  expired: 'expired',
};

type KycStatus = 'none' | 'pending' | 'verified' | 'failed' | 'manual_review';

const kycStatusToBadge: Record<KycStatus, 'pending' | 'verified' | 'rejected' | 'attention'> = {
  none: 'pending',
  pending: 'pending',
  verified: 'verified',
  failed: 'rejected',
  manual_review: 'attention',
};

export function StudentRecordDrawer({
  studentId,
  open,
  onOpenChange,
}: StudentRecordDrawerProps) {
  const copy = adminCopy.studentRecord;

  const { data, isLoading, isError } = trpc.admin.getStudentRecord.useQuery(
    { studentId: studentId! },
    { enabled: Boolean(studentId) },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-foreground dark:text-foreground">
            {copy.drawerTitle}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-8 pt-2">
          {isLoading && (
            <div className="space-y-3" aria-label={copy.loading}>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {isError && !isLoading && (
            <p className="text-sm text-destructive">{copy.error}</p>
          )}

          {data && !isLoading && (
            <>
              {/* Identity */}
              <section aria-labelledby="sr-identity">
                <p
                  id="sr-identity"
                  className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  {copy.sections.identity}
                </p>
                <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <IdentificationCard
                      size={20}
                      weight="duotone"
                      className="mt-0.5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {copy.labels.email}
                      </p>
                      <p className="truncate font-medium text-foreground dark:text-foreground">
                        {data.student.email ?? '—'}
                      </p>
                    </div>
                  </div>
                  {data.student.phoneLastFour && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {copy.labels.phone}
                      </p>
                      <p className="font-medium text-foreground dark:text-foreground">
                        •••• {data.student.phoneLastFour}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* KYC */}
              <section aria-labelledby="sr-kyc">
                <p
                  id="sr-kyc"
                  className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  {copy.sections.kyc}
                </p>
                <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
                  <UserCheck size={20} weight="duotone" className="shrink-0 text-muted-foreground" />
                  <StatusBadge
                    status={kycStatusToBadge[data.student.kycStatus]}
                    label={copy.kycLabels[data.student.kycStatus]}
                    size="sm"
                  />
                </div>
              </section>

              {/* Documents */}
              <section aria-labelledby="sr-documents">
                <p
                  id="sr-documents"
                  className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  {copy.sections.documents}
                </p>
                {data.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {copy.empty.documents}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="rounded-lg border border-border bg-card p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground dark:text-foreground">
                            {formatDocumentType(doc.documentType)}
                          </p>
                          <StatusBadge
                            status={docStatusToBadge[doc.status] ?? 'pending'}
                            size="sm"
                          />
                        </div>
                        {doc.rejectionReason && (
                          <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                            <span className="font-medium">{copy.labels.rejectionReason}:</span>{' '}
                            {doc.rejectionReason}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Sponsors */}
              <section aria-labelledby="sr-sponsors">
                <p
                  id="sr-sponsors"
                  className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  {copy.sections.sponsors}
                </p>
                {data.sponsors.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {copy.empty.sponsors}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.sponsors.map((sponsor, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg border border-border bg-card p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Money size={16} weight="duotone" className="shrink-0 text-muted-foreground" />
                            <p className="truncate font-medium text-foreground dark:text-foreground">
                              {sponsor.sponsorName}
                            </p>
                          </div>
                          <p className="shrink-0 font-mono text-xs font-semibold text-foreground dark:text-foreground">
                            {formatNGN(sponsor.amountKobo)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                          {sponsor.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Certificate */}
              <section aria-labelledby="sr-certificate">
                <p
                  id="sr-certificate"
                  className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground"
                >
                  {copy.sections.certificate}
                </p>
                {!data.certificate ? (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {copy.empty.certificate}
                  </p>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Certificate size={20} weight="duotone" className="shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {copy.labels.certId}
                        </p>
                        <p className="font-mono text-xs font-medium text-foreground dark:text-foreground">
                          {data.certificate.certificateId}
                        </p>
                      </div>
                    </div>
                    {data.certificate.issuedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {copy.labels.issuedAt}
                        </p>
                        <p className="text-foreground dark:text-foreground">
                          <TimestampLabel value={data.certificate.issuedAt} mode="both" />
                        </p>
                      </div>
                    )}
                    {data.certificate.paymentStatus && (
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {copy.labels.paymentStatus}
                        </p>
                        <p className="text-foreground dark:text-foreground">
                          {data.certificate.paymentStatus}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
