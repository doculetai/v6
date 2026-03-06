'use client';

import { CircleNotch, Copy, Shield, ShieldCheck, ShieldSlash, Warning } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrustSignal } from '@/components/ui/trust-signal';
import { studentCopy } from '@/config/copy/student';
import { uiPrimitives } from '@/config/copy/primitives';

type ProofCertificate = {
  issued: boolean;
  certificateId: string | null;
  issuedAt: string | null;
  sharePath: string | null;
};

type ProofTrust = {
  sponsorCount: number;
  committedAmountKobo: number;
  currency: string;
  approvedDocumentCount: number;
  pendingDocumentCount: number;
  lastAuditAt: string | null;
};

type ProofCertificateCardProps = {
  certificate: ProofCertificate;
  trust: ProofTrust;
  canGenerateShareLink: boolean;
  shareLink: string | null;
  isGeneratingShareLink: boolean;
  shareError: string | null;
  isCopying: boolean;
  onGenerateShareLink: () => void;
  onCopyShareLink: () => void;
};

export function ProofCertificateCard({
  certificate,
  trust,
  canGenerateShareLink,
  shareLink,
  isGeneratingShareLink,
  shareError,
  isCopying,
  onGenerateShareLink,
  onCopyShareLink,
}: ProofCertificateCardProps) {
  const generateCta = getGenerateCtaLabel({
    issued: certificate.issued,
    isGeneratingShareLink,
  });

  return (
    <Card className="relative overflow-hidden border-border bg-card/80 shadow-xl backdrop-blur-sm ring-1 ring-primary/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5"
      />

      <CardHeader className="relative space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/80 px-4 text-sm font-medium text-foreground">
            <ShieldCheck weight="duotone" className="size-5 text-primary" aria-hidden="true" />
            <span className="font-serif text-xl font-semibold text-foreground">{studentCopy.proof.certificate.title}</span>
          </div>

          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/80 px-4 text-xs font-medium text-foreground">
            {certificate.issued ? (
              <Shield weight="duotone" className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <ShieldSlash weight="duotone" className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span>
              {certificate.issued
                ? studentCopy.proof.certificate.issuedBadge
                : studentCopy.proof.certificate.lockedBadge}
            </span>
          </div>
        </div>

        <CardDescription className="text-sm text-muted-foreground md:text-base">
          {studentCopy.proof.certificate.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <CertificateMeta certificate={certificate} />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {studentCopy.proof.certificate.trustTitle}
          </h3>
          <TrustSignals trust={trust} />
          <TrustSignal message={uiPrimitives.trustSignals.certificate} className="mt-2" />
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-background/75 p-4">
          <label
            htmlFor="proof-share-link"
            className="block text-xs font-medium text-muted-foreground"
          >
            {studentCopy.proof.certificate.shareLinkLabel}
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="proof-share-link"
              readOnly
              value={shareLink ?? studentCopy.proof.certificate.noShareLink}
              className="min-h-11 flex-1 border-border bg-background"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onCopyShareLink}
              disabled={!shareLink || isCopying}
              className="min-h-11 w-full gap-2 sm:w-auto"
            >
              <Copy weight="duotone" className="size-5" aria-hidden="true" />
              <span>
                {isCopying
                  ? studentCopy.proof.certificate.copiedLinkCta
                  : studentCopy.proof.certificate.copyLinkCta}
              </span>
            </Button>
          </div>

          <Button
            type="button"
            onClick={onGenerateShareLink}
            disabled={!canGenerateShareLink || isGeneratingShareLink}
            className="min-h-11 w-full gap-2"
          >
            {isGeneratingShareLink ? (
              <CircleNotch weight="duotone" className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck weight="duotone" className="size-5" aria-hidden="true" />
            )}
            <span>{generateCta}</span>
          </Button>

          {!canGenerateShareLink ? (
            <p className="text-xs text-muted-foreground">
              {studentCopy.proof.locked.helper}
            </p>
          ) : null}

          {shareError ? (
            <p className="inline-flex items-center gap-2 text-sm text-destructive">
              <Warning weight="duotone" className="size-4" aria-hidden="true" />
              <span>{shareError}</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

type CertificateMetaProps = {
  certificate: ProofCertificate;
};

function CertificateMeta({ certificate }: CertificateMetaProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background/75 p-4  sm:grid-cols-2">
      <MetaItem
        label={studentCopy.proof.certificate.idLabel}
        value={certificate.certificateId ? truncateCertificateId(certificate.certificateId) : null}
      />
      <MetaItem
        label={studentCopy.proof.certificate.issuedAtLabel}
        value={certificate.issuedAt ? formatDateTime(certificate.issuedAt) : null}
      />
    </div>
  );
}

type TrustSignalsProps = {
  trust: ProofTrust;
};

function TrustSignals({ trust }: TrustSignalsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <MetaItem
        label={studentCopy.proof.certificate.trust.sponsorCountLabel}
        value={String(trust.sponsorCount)}
      />
      <MetaItem
        label={studentCopy.proof.certificate.trust.committedAmountLabel}
        value={formatCurrency(trust.committedAmountKobo, trust.currency)}
      />
      <MetaItem
        label={studentCopy.proof.certificate.trust.approvedDocumentsLabel}
        value={String(trust.approvedDocumentCount)}
      />
      <MetaItem
        label={studentCopy.proof.certificate.trust.pendingDocumentsLabel}
        value={String(trust.pendingDocumentCount)}
      />
      <MetaItem
        label={studentCopy.proof.certificate.trust.lastAuditLabel}
        value={trust.lastAuditAt ? formatDateTime(trust.lastAuditAt) : null}
      />
    </div>
  );
}

type MetaItemProps = {
  label: string;
  value: string | null;
};

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div className="min-h-11 rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">
        {value ?? studentCopy.proof.certificate.unavailableValue}
      </p>
    </div>
  );
}

type GenerateCtaLabelInput = {
  issued: boolean;
  isGeneratingShareLink: boolean;
};

function getGenerateCtaLabel({ issued, isGeneratingShareLink }: GenerateCtaLabelInput): string {
  if (isGeneratingShareLink) {
    return studentCopy.proof.certificate.generatingCta;
  }

  if (issued) {
    return studentCopy.proof.certificate.regenerateShareCta;
  }

  return studentCopy.proof.certificate.generateShareCta;
}

function truncateCertificateId(certificateId: string): string {
  return `${certificateId.slice(0, 8)}…${certificateId.slice(-6)}`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(amountKobo: number, currency: string): string {
  const amountInMajorUnit = amountKobo / 100;

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInMajorUnit);
}
