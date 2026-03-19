'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { List, X } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { landingCopy as copy } from '@/config/copy/landing';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        {copy.nav.skipToContent}
      </a>

      <nav
        className={cn(
          'sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-shadow duration-200 md:px-10',
          scrolled ? 'border-b border-border bg-background shadow-sm' : 'bg-background',
        )}
      >
        <Link href={routes.home} className="flex items-center gap-2.5">
          <Image
            src="/brand/assets/logo/doculet-shield-32.png"
            alt={primitivesCopy.brand.logoAlt}
            width={28}
            height={28}
            priority
          />
          <span className="font-serif text-base font-semibold tracking-[-0.01em] text-primary">
            Doculet
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {copy.nav.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={routes.auth.login}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {copy.nav.signIn}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden rounded-full md:inline-flex">
            <Link href={routes.auth.signup}>{copy.nav.cta}</Link>
          </Button>
          <button
            className="min-h-[44px] min-w-[44px] rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={primitivesCopy.ariaExtended.openMenu}
          >
            <List weight="duotone" size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.nav.ariaLabel}
          className="fixed inset-0 z-50 flex flex-col bg-background px-8 pt-6 md:hidden"
          onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}
        >
          <div className="flex items-center justify-between">
            <Link href={routes.home} className="flex items-center gap-2.5">
              <Image
                src="/brand/assets/logo/doculet-shield-32.png"
                alt={primitivesCopy.brand.logoAlt}
                width={28}
                height={28}
              />
              <span className="font-serif text-base font-semibold text-primary">{copy.nav.brandName}</span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="min-h-[44px] min-w-[44px] rounded-md p-1.5 text-muted-foreground"
              aria-label={primitivesCopy.ariaExtended.closeMenu}
            >
              <X weight="duotone" size={22} />
            </button>
          </div>

          <div className="mt-10 flex flex-col gap-0">
            {copy.nav.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 text-xl font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={routes.auth.login}
              onClick={() => setMenuOpen(false)}
              className="border-b border-border py-4 text-xl font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {copy.nav.signIn}
            </Link>
            <Link
              href={routes.auth.signup}
              onClick={() => setMenuOpen(false)}
              className="mt-6 py-4 text-xl font-semibold text-primary"
            >
              {copy.nav.cta}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
