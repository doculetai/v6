import Image from 'next/image';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { landingCopy as copy } from '@/config/copy/landing';
import { cn } from '@/lib/utils';

const cert = copy.certificate;

/** Small card — used in hero section */
export function CertificateCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      {/* Brand stripe */}
      <div className="h-1 bg-[linear-gradient(90deg,#2B39A3,#2563EB)]" />

      <div className="p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {cert.badge}
            </p>
            <p className="mt-0.5 font-serif text-sm font-semibold text-[#2B39A3]">
              {cert.brand}
            </p>
          </div>
          <Image
            src="/brand/assets/logo/doculet-shield-24.png"
            alt="Doculet"
            width={24}
            height={24}
          />
        </div>

        <div className="mb-4 h-px bg-[rgba(43,57,163,0.12)]" />

        {/* Fields */}
        <div className="mb-4 space-y-2.5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              {cert.holderLabel}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{cert.holder}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {cert.balanceLabel}
              </p>
              <p className="mt-0.5 font-mono text-[13px] font-medium text-foreground">
                {cert.balance}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                {cert.institutionLabel}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-foreground">{cert.institution}</p>
            </div>
          </div>
        </div>

        <div className="mb-3 h-px bg-border" />

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {cert.status}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">{cert.serial}</span>
        </div>
      </div>
    </div>
  );
}

/** Full cert — used in trust/dark section */
export function CertificateFull({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-[420px] overflow-hidden rounded-2xl border border-[rgba(212,168,83,0.4)] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      {/* Gold stripe */}
      <div className="h-[5px] bg-[linear-gradient(90deg,#B8902A,#E8C97A,#D4A853,#E8C97A,#B8902A)]" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {cert.fullTitle}
            </p>
            <p className="mt-1 font-serif text-xl font-semibold text-[#2B39A3]">{cert.brand}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{cert.fullSubtitle}</p>
          </div>
          <Image
            src="/brand/assets/logo/doculet-shield-40.png"
            alt="Doculet"
            width={40}
            height={40}
          />
        </div>

        <div className="mb-4 h-px bg-[linear-gradient(90deg,#2B39A3,rgba(43,57,163,0.1))]" />

        <p className="mb-5 font-serif text-[13px] italic leading-relaxed text-muted-foreground">
          {cert.fullBodyText}
        </p>

        {/* Fields grid */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          {cert.fullFields.map(({ label, value, mono }) => (
            <div key={label}>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {label}
              </p>
              <p className={cn('mt-1 text-[13px] font-semibold', mono && 'font-mono')}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-4 h-px bg-border" />

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              {cert.serialLabel}
            </p>
            <p className="mt-1 font-mono text-[12px] font-semibold text-foreground">
              {cert.fullSerial}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">{cert.fullVerifyUrl}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(212,168,83,0.4)]">
            <Image
              src="/brand/assets/logo/doculet-shield-32.png"
              alt="Doculet seal"
              width={28}
              height={28}
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-700">
            <CheckCircle weight="duotone" size={14} />
            {cert.fullStatus} · {cert.fullIssued}
          </span>
        </div>
      </div>
    </div>
  );
}
