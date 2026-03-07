'use client';

import { FileText, User } from '@/components/icons';

import { StatusBadge } from '@/components/ui/status-badge';
import type { StatusBadgeStatus } from '@/components/ui/status-badge';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { adminCopy } from '@/config/copy/admin';
import { formatCurrency, formatDocumentType } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface AdminStudentRecordSheetProps {
  studentId: string | null;
  onClose: () => void;
}

const copy = adminCopy.studentRecord;

type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'failed';

function verificationToBadge(status: string): StatusBadgeStatus {
  const map: Record<VerificationStatus, StatusBadgeStatus> = {
    not_started: 'pending',
    pending: 'pending',
    verified: 'verified',
    failed: 'rejected',
  };
  return map[status as VerificationStatus] ?? 'pending';
}

type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';

function documentToBadge(status: string): StatusBadgeStatus {
  const map: Record<DocumentStatus, StatusBadgeStatus> = {
    pending: 'pending',
    approved: 'verified',
    rejected: 'rejected',
    more_info_requested: 'attention',
    expired: 'expired',
  };
  return map[status as DocumentStatus] ?? 'pending';
}

type SponsorshipStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'withdrawn';

function sponsorshipToBadge(status: string): StatusBadgeStatus {
  const map: Record<SponsorshipStatus, StatusBadgeStatus> = {
    pending: 'pending',
    active: 'verified',
    completed: 'verified',
    cancelled: 'expired',
    withdrawn: 'expired',
  };
  return map[status as SponsorshipStatus] ?? 'pending';
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium text-foreground">{value ?? '—'}</span>
    </div>
  );
}

function RecordContent({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = trpc.admin.getStudentRecord.useQuery(
    { studentId },
    { enabled: !!studentId },
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{copy.error}</p>
      </div>
    );
  }

  const fundingLabel =
    copy.fundingTypeLabels[data.fundingType as keyof typeof copy.fundingTypeLabels] ??
    data.fundingType;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-6 pb-8 pt-4">
      {/* Identity */}
      <section>
        <SectionLabel label={copy.sections.identity} />
        <div className="rounded-lg border border-border bg-card px-4 py-1 divide-y divide-border/50">
          <FieldRow label={copy.labels.email} value={data.email} />
          <FieldRow label={copy.labels.fullName} value={data.fullName} />
          <FieldRow label={copy.labels.phone} value={data.phone} />
          <FieldRow label={copy.labels.school} value={data.schoolName} />
          <FieldRow label={copy.labels.program} value={data.programName} />
          <FieldRow label={copy.labels.fundingType} value={fundingLabel} />
          <FieldRow
            label={copy.labels.onboarding}
            value={
              <StatusBadge
                status={data.onboardingComplete ? 'verified' : 'pending'}
                label={data.onboardingComplete ? 'Complete' : 'Incomplete'}
                size="sm"
              />
            }
          />
          {data.suspendedAt && (
            <FieldRow
              label="Suspended"
              value={<TimestampLabel value={data.suspendedAt} mode="absolute" />}
            />
          )}
        </div>
      </section>

      {/* Verification */}
      <section>
        <SectionLabel label={copy.sections.verification} />
        <div className="rounded-lg border border-border bg-card px-4 py-1 divide-y divide-border/50">
          <FieldRow
            label={copy.labels.kycStatus}
            value={
              <StatusBadge
                status={verificationToBadge(data.kycStatus)}
                label={copy.statusLabels[data.kycStatus as keyof typeof copy.statusLabels] ?? data.kycStatus}
                size="sm"
              />
            }
          />
          <FieldRow
            label={copy.labels.bankStatus}
            value={
              <StatusBadge
                status={verificationToBadge(data.bankStatus)}
                label={copy.statusLabels[data.bankStatus as keyof typeof copy.statusLabels] ?? data.bankStatus}
                size="sm"
              />
            }
          />
          {data.bankAccountLinked && (
            <>
              <FieldRow label={copy.labels.bankName} value={data.bankName} />
              <FieldRow
                label={copy.labels.accountNumber}
                value={data.accountNumber ? `****${data.accountNumber.slice(-4)}` : null}
              />
            </>
          )}
        </div>
      </section>

      {/* Documents */}
      <section>
        <SectionLabel label={copy.sections.documents} />
        {data.documents.length === 0 ? (
          <p className="text-xs text-muted-foreground">{copy.noDocuments}</p>
        ) : (
          <ul className="space-y-2">
            {data.documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} weight="duotone" aria-hidden="true" className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs font-medium text-foreground">
                      {formatDocumentType(doc.type)}
                    </span>
                  </div>
                  <StatusBadge status={documentToBadge(doc.status)} size="sm" />
                </div>
                {doc.reviewedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.labels.status}:{' '}
                    <TimestampLabel value={doc.reviewedAt} mode="absolute" />
                  </p>
                )}
                {doc.rejectionReason && (
                  <p className="mt-1 text-xs text-destructive">{doc.rejectionReason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sponsorships */}
      <section>
        <SectionLabel label={copy.sections.sponsorships} />
        {data.sponsorships.length === 0 ? (
          <p className="text-xs text-muted-foreground">{copy.noSponsorships}</p>
        ) : (
          <ul className="space-y-2">
            {data.sponsorships.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      {s.sponsorName ?? s.sponsorEmail ?? '—'}
                    </p>
                    {s.relationship && (
                      <p className="text-xs text-muted-foreground">{s.relationship}</p>
                    )}
                  </div>
                  <StatusBadge status={sponsorshipToBadge(s.status)} size="sm" />
                </div>
                <p className="mt-1 font-mono text-xs text-foreground">
                  {formatCurrency(s.amountKobo / 100, s.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Certificate */}
      <section>
        <SectionLabel label={copy.sections.certificate} />
        {!data.certificate ? (
          <p className="text-xs text-muted-foreground">{copy.noCertificate}</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-4 py-1 divide-y divide-border/50">
            <FieldRow label={copy.labels.certId} value={`DOC-${data.certificate.certId.slice(0, 8).toUpperCase()}`} />
            <FieldRow
              label={copy.labels.issuedAt}
              value={<TimestampLabel value={data.certificate.issuedAt} mode="absolute" />}
            />
            <FieldRow
              label={copy.labels.certStatus}
              value={
                <StatusBadge
                  status={data.certificate.status === 'active' ? 'verified' : 'expired'}
                  label={copy.statusLabels[data.certificate.status as keyof typeof copy.statusLabels] ?? data.certificate.status}
                  size="sm"
                />
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminStudentRecordSheet({
  studentId,
  onClose,
}: AdminStudentRecordSheetProps) {
  return (
    <Sheet open={studentId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <User size={20} weight="duotone" aria-hidden="true" className="text-muted-foreground" />
            {copy.title}
          </SheetTitle>
        </SheetHeader>
        {studentId && <RecordContent studentId={studentId} />}
      </SheetContent>
    </Sheet>
  );
}
