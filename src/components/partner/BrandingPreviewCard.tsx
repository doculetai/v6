import Image from 'next/image';
import { CheckCircle, Shield } from 'lucide-react';

import { partnerCopy } from '@/config/copy/partner';

const DEFAULT_COLOR = '#1e40af';

type BrandingPreviewCardProps = {
  organizationName: string;
  brandLogoUrl: string | null;
  brandColor: string | null;
};

export function BrandingPreviewCard({
  organizationName,
  brandLogoUrl,
  brandColor,
}: BrandingPreviewCardProps) {
  const primaryColor = brandColor ?? DEFAULT_COLOR;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card"
      role="img"
      aria-label={partnerCopy.branding.previewSection.title}
    >
      {/* Widget header — background is the dynamic partner color */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ backgroundColor: primaryColor }}
      >
        {brandLogoUrl ? (
          <Image
            src={brandLogoUrl}
            alt={organizationName}
            width={120}
            height={28}
            className="max-h-7 w-auto object-contain"
            unoptimized
          />
        ) : (
          <Shield className="size-6" style={{ color: '#ffffff' }} aria-hidden="true" />
        )}
        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
          {organizationName}
        </span>
      </div>

      {/* Widget body */}
      <div className="space-y-4 px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
          {partnerCopy.branding.previewSection.widgetLabel}
        </p>

        <div className="rounded-lg border border-border bg-background px-4 py-3 dark:border-border dark:bg-background">
          <p className="text-sm font-semibold text-foreground dark:text-foreground">
            Adaeze Okonkwo
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground dark:text-muted-foreground">
            University of Lagos · MSc Computer Science
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-border bg-background px-4 py-3 dark:border-border dark:bg-background">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Verified balance
            </p>
            <p className="mt-0.5 text-lg font-semibold text-foreground dark:text-foreground">
              &#8358;12,500,000
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-border bg-background px-4 py-3 dark:border-border dark:bg-background">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">Valid until</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground dark:text-foreground">
              Sep 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 dark:border-border dark:bg-background">
          <CheckCircle
            className="size-4 shrink-0 text-success dark:text-success"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {partnerCopy.branding.previewSection.verifiedBy}{' '}
            <span className="font-mono">DOC-2026-4482</span>
          </p>
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity"
          style={{ backgroundColor: primaryColor, color: '#ffffff' }}
        >
          {partnerCopy.branding.previewSection.viewCta}
        </button>
      </div>
    </div>
  );
}
