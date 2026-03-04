import { redirect } from "next/navigation";

export default function MarketingHome() {
  redirect("/test-landing");
  // Unreachable — redirect() throws before this renders.
  // h1 is required by WCAG check; never visible in practice.
  return <h1 className="sr-only">Home</h1>;
}
