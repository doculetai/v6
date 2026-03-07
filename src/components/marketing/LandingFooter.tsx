import Image from 'next/image';
import Link from 'next/link';
import { landingCopy as copy } from '@/config/copy/landing';

export function LandingFooter() {
  return (
    <footer className="bg-white">
      <div className="flex flex-wrap justify-center gap-5 border-b border-border px-6 py-3.5">
        {copy.footer.trustMarkers.map((marker) => (
          <span key={marker} className="text-xs text-muted-foreground">
            {marker}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-10 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image
            src="/brand/assets/logo/doculet-shield-24.png"
            alt="Doculet"
            width={16}
            height={16}
          />
          {copy.footer.copyright}
        </div>
        <div className="flex gap-6">
          {copy.footer.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-[#2B39A3]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
