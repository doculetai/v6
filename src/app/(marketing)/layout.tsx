import type { Metadata } from "next";

import { landingCopy } from '@/config/copy/landing';

export const metadata: Metadata = {
  title: {
    default: landingCopy.meta.title,
    template: "%s — Doculet.ai",
  },
  description: landingCopy.meta.description,
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
