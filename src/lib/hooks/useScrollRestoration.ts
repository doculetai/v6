'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'doculet-scroll-';

/**
 * Restores scroll position for the given scrollable element when returning
 * to a route (back/forward navigation). Saves position on route change.
 *
 * Usage:
 *   const mainRef = useRef<HTMLElement>(null);
 *   useScrollRestoration(mainRef);
 */
export function useScrollRestoration(ref: React.RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Save scroll position from the previous path before restoring
    if (previousPath.current !== pathname) {
      // Already saved in the cleanup below
      previousPath.current = pathname;
    }

    // Restore scroll position for the current path
    const key = `${STORAGE_PREFIX}${pathname}`;
    const savedY = sessionStorage.getItem(key);
    if (savedY) {
      const y = parseInt(savedY, 10);
      if (!Number.isNaN(y)) {
        // Defer to let content render
        requestAnimationFrame(() => {
          el.scrollTo(0, y);
        });
      }
    }

    // Continuously track scroll position
    const handleScroll = () => {
      sessionStorage.setItem(key, String(el.scrollTop));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, ref]);
}
