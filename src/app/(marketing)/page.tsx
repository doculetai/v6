import type { Metadata } from 'next';

import { landingCopy } from '@/config/copy/landing';
import { LandingNav } from '@/components/marketing/LandingNav';
import { LandingHero } from '@/components/marketing/LandingHero';
import { LandingProblem } from '@/components/marketing/LandingProblem';
import { LandingSteps } from '@/components/marketing/LandingSteps';
import { LandingTrust } from '@/components/marketing/LandingTrust';
import { LandingFaq } from '@/components/marketing/LandingFaq';
import { LandingCta } from '@/components/marketing/LandingCta';
import { LandingFooter } from '@/components/marketing/LandingFooter';

export const metadata: Metadata = {
  title: landingCopy.meta.title,
  description: landingCopy.meta.description,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingSteps />
        <LandingTrust />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
