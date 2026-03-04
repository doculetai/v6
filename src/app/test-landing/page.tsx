import type { Metadata } from "next";

import { landingCopy } from "@/config/copy/test-landing";

import { TestLandingClient } from "./test-landing-client";

export const metadata: Metadata = {
  title: "Doculet.ai — Nigerian Bank Statements, Trusted by US Universities",
  description:
    "Doculet verifies Nigerian bank statements via PDF upload or live bank connection and stamps them with a cryptographic seal that US admissions offices can authenticate instantly.",
  openGraph: {
    title: "Doculet.ai — Proof of Funds, Verified",
    description:
      "Stop losing your university offer over unverifiable bank statements. Get the Doculet Seal.",
    siteName: "Doculet.ai",
    locale: "en_US",
    type: "website",
  },
};

export default function TestLandingPage() {
  return (
    <>
      <h1 className="sr-only">{`${landingCopy.hero.headline} ${landingCopy.hero.headlineAccent}`}</h1>
      <TestLandingClient />
    </>
  );
}
