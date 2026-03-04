import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Doculet.ai — Proof of Funds Verification",
    template: "%s — Doculet.ai",
  },
  description:
    "Connecting Nigerian students, sponsors, and US universities with verified proof-of-funds documentation.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
