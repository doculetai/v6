"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingCopy as copy } from "@/config/copy/test-landing";

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <Image
            src="/brand/logos/icon.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            {copy.nav.brand}
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col px-5 pt-6">
        <ul className="space-y-1">
          {copy.nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={onClose}
                className="flex min-h-[52px] items-center rounded-xl px-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            onClick={onClose}
            className="flex min-h-[52px] items-center justify-center rounded-xl border border-border text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {copy.nav.signIn}
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#000080] text-[15px] font-bold text-white transition-colors hover:bg-[#00006a]"
          >
            {copy.nav.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border/50 bg-background/90 backdrop-blur-xl shadow-sm"
            : "bg-transparent",
        )}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/logos/icon.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              {copy.nav.brand}
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {copy.nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden min-h-[44px] items-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:inline-flex"
            >
              {copy.nav.signIn}
            </Link>

            <Button
              asChild
              className="hidden min-h-[44px] rounded-full bg-[#000080] px-5 text-[13px] font-semibold text-white hover:bg-[#00006a] md:inline-flex"
            >
              <Link href="/signup">
                {copy.nav.cta}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
