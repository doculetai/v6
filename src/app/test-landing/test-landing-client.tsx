"use client";

import { Nav } from "./landing-nav";
import { Hero } from "./landing-hero";
import { Problem } from "./landing-problem";
import { Steps } from "./landing-steps";
import { University } from "./landing-university";
import { Security } from "./landing-security";
import { FAQ } from "./landing-faq";
import { FinalCta } from "./landing-cta";
import { Footer } from "./landing-footer";

export function TestLandingClient() {
  return (
    <main className="min-h-screen bg-background antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Nav />
      <Hero />
      <Problem />
      <Steps />
      <University />
      <Security />
      <FAQ />
      <FinalCta />
      <Footer />
    </main>
  );
}
