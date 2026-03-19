'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Thin progress bar shown at the top of the content zone during route transitions.
 * Detects navigation via pathname change and animates a 2px bar across the top.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Route changed — show bar briefly then hide
      setIsNavigating(true);
      prevPathname.current = pathname;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 400);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return (
    <div
      role="progressbar"
      aria-hidden={!isNavigating}
      className={cn(
        'pointer-events-none absolute left-0 right-0 top-0 z-50 h-0.5 origin-left',
        'bg-primary transition-[transform,opacity] duration-300 ease-out',
        isNavigating ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
      )}
    />
  );
}
