import Image from "next/image";
import Link from "next/link";
import { landingCopy as copy } from "@/config/copy/test-landing";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 md:flex-row md:gap-4 md:px-8">
        {/* Brand + copyright */}
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-6 md:text-left">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/logos/icon.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-foreground">
              {copy.nav.brand}
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            {copy.footer.copyright} &middot; {copy.footer.address}
          </p>
        </div>

        {/* Regulatory + links */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
          <p className="text-xs text-muted-foreground">
            {copy.footer.regulatory}
          </p>
          {copy.footer.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
