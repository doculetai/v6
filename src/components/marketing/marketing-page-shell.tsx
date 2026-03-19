import Image from 'next/image';
import Link from 'next/link';

import { marketingCopy } from '@/config/copy/marketing';
import { primitivesCopy } from '@/config/copy/primitives';
import { routes } from '@/config/routes';

type MarketingPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function MarketingPageShell({ title, description, children }: MarketingPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href={routes.marketing.landing} className="inline-flex items-center gap-3">
            <Image
              src="/brand/logos/logo.svg"
              alt={primitivesCopy.brand.logoFullAlt}
              width={132}
              height={34}
              className="h-auto w-32"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href={routes.marketing.about} className="hover:text-foreground">
              {marketingCopy.shell.nav.about}
            </Link>
            <Link href={routes.marketing.pricing} className="hover:text-foreground">
              {marketingCopy.shell.nav.pricing}
            </Link>
            <Link href={routes.marketing.contact} className="hover:text-foreground">
              {marketingCopy.shell.nav.contact}
            </Link>
            <Link href={routes.auth.login} className="font-medium text-primary hover:text-primary/80">
              {marketingCopy.shell.nav.signIn}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="mb-8 md:mb-10">
          <h1 className="font-serif text-4xl tracking-tight text-foreground md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        </section>
        <section className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm md:p-8">
          {children}
        </section>
      </main>

      <footer className="border-t border-border/70 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Image
              src="/brand/assets/logo/doculet-shield-24.png"
              alt={primitivesCopy.brand.logoAlt}
              width={16}
              height={16}
            />
            {marketingCopy.shell.footer.copyright}
          </div>
          <div className="flex gap-6">
            <Link href={routes.marketing.privacy} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {marketingCopy.shell.footer.privacy}
            </Link>
            <Link href={routes.marketing.terms} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {marketingCopy.shell.footer.terms}
            </Link>
            <Link href={routes.marketing.contact} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {marketingCopy.shell.footer.contact}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

