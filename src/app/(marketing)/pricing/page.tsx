import type { Metadata } from 'next';
import Link from 'next/link';
import {
  GraduationCap,
  Handshake,
  Buildings,
  UserCircleGear,
  Globe,
  Check,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { marketingCopy } from '@/config/copy/marketing';

export const metadata: Metadata = {
  title: `${marketingCopy.pricing.title} — Doculet`,
  description: marketingCopy.pricing.subtitle,
  openGraph: {
    title: `${marketingCopy.pricing.title} — Doculet`,
    description: marketingCopy.pricing.subtitle,
    url: 'https://doculet.ai/pricing',
    siteName: 'Doculet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${marketingCopy.pricing.title} — Doculet`,
    description: marketingCopy.pricing.subtitle,
  },
};

type PricingTierProps = {
  icon: React.ReactNode;
  title: string;
  audience: string;
  price: string;
  priceLabel: string;
  features: readonly string[];
  note?: string;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
};

function PricingTier({
  icon,
  title,
  audience,
  price,
  priceLabel,
  features,
  note,
  cta,
  ctaHref,
  highlighted,
}: PricingTierProps) {
  return (
    <div
      className={[
        'flex flex-col rounded-xl border bg-card p-6 shadow-sm',
        highlighted ? 'border-primary ring-1 ring-primary' : 'border-border',
      ].join(' ')}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{audience}</p>

      <div className="mb-5">
        <span className="font-mono text-2xl font-bold text-foreground">{price}</span>
        <span className="ml-2 text-sm text-muted-foreground">{priceLabel}</span>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check weight="duotone" size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mb-4 text-xs text-muted-foreground">{note}</p>
      )}

      <Button
        asChild
        variant={highlighted ? 'default' : 'outline'}
        className="mt-auto min-h-[44px] w-full"
      >
        <Link href={ctaHref}>{cta}</Link>
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const { pricing } = marketingCopy;

  return (
    <MarketingPageShell title={pricing.title} description={pricing.subtitle}>
      <div className="space-y-8">
        {/* Primary tiers — Student (highlighted) + Sponsor */}
        <div className="grid gap-6 md:grid-cols-2">
          <PricingTier
            icon={<GraduationCap size={24} weight="duotone" />}
            title={pricing.student.title}
            audience={pricing.student.audience}
            price={pricing.student.certFee}
            priceLabel={pricing.student.certFeeLabel}
            features={pricing.student.features}
            note={pricing.student.certNote}
            cta={pricing.student.cta}
            ctaHref={pricing.student.ctaHref}
            highlighted
          />
          <PricingTier
            icon={<Handshake size={24} weight="duotone" />}
            title={pricing.sponsor.title}
            audience={pricing.sponsor.audience}
            price={pricing.sponsor.free}
            priceLabel={pricing.sponsor.freeLabel}
            features={pricing.sponsor.features}
            cta={pricing.sponsor.cta}
            ctaHref={pricing.sponsor.ctaHref}
          />
        </div>

        {/* Institutional tiers — University, Agent, Partner */}
        <div className="grid gap-6 md:grid-cols-3">
          <PricingTier
            icon={<Buildings size={24} weight="duotone" />}
            title={pricing.university.title}
            audience={pricing.university.audience}
            price={pricing.university.free}
            priceLabel={pricing.university.freeLabel}
            features={pricing.university.features}
            cta={pricing.university.cta}
            ctaHref={pricing.university.ctaHref}
          />
          <PricingTier
            icon={<UserCircleGear size={24} weight="duotone" />}
            title={pricing.agent.title}
            audience={pricing.agent.audience}
            price={pricing.agent.free}
            priceLabel={pricing.agent.freeLabel}
            features={pricing.agent.features}
            cta={pricing.agent.cta}
            ctaHref={pricing.agent.ctaHref}
          />
          <PricingTier
            icon={<Globe size={24} weight="duotone" />}
            title={pricing.partner.title}
            audience={pricing.partner.audience}
            price={pricing.partner.free}
            priceLabel={pricing.partner.freeLabel}
            features={pricing.partner.features}
            cta={pricing.partner.cta}
            ctaHref={pricing.partner.ctaHref}
          />
        </div>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground">
          {pricing.faqNote}{' '}
          <a
            href={`mailto:${pricing.faqEmail}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {pricing.faqEmail}
          </a>
          .
        </p>
      </div>
    </MarketingPageShell>
  );
}
