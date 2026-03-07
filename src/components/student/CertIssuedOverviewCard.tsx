import { ArrowRight, SealCheck } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { studentHomeCopy } from '@/config/copy/dashboard-shell';

type CertIssuedOverviewCardProps = {
  certificateId: string | null;
  issuedAt: string | null;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(value));
}

function truncateId(id: string): string {
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export function CertIssuedOverviewCard({
  certificateId,
  issuedAt,
}: CertIssuedOverviewCardProps) {
  const copy = studentHomeCopy.postCert.certCard;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <SealCheck className="size-3.5" weight="duotone" aria-hidden="true" />
          {copy.eyebrow}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {certificateId ? (
            <div>
              <p className="text-xs text-muted-foreground">{copy.idLabel}</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-foreground tabular-nums">
                {truncateId(certificateId)}
              </p>
            </div>
          ) : null}

          {issuedAt ? (
            <div>
              <p className="text-xs text-muted-foreground">{copy.issuedLabel}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {formatDate(issuedAt)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <Button asChild size="sm" className="mt-1 min-h-11 shrink-0 sm:mt-0">
        <Link href={copy.viewHref} className="inline-flex items-center gap-1.5">
          {copy.viewCta}
          <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
