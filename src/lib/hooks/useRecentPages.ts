'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'doculet-recent-pages';
const MAX_RECENT = 2;

export type RecentPage = {
  href: string;
  label: string;
  visitedAt: number;
};

/**
 * Tracks and returns the last 2 visited dashboard pages.
 * Stored in sessionStorage (cleared when browser closes).
 */
export function useRecentPages(role: string) {
  const storageKey = `${STORAGE_KEY}-${role}`;
  const [pages, setPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentPage[];
        if (Array.isArray(parsed)) setPages(parsed.slice(0, MAX_RECENT));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  return pages;
}

/**
 * Records a page visit. Call from layout or page components.
 */
export function recordPageVisit(role: string, href: string, label: string) {
  const storageKey = `${STORAGE_KEY}-${role}`;
  try {
    const stored = sessionStorage.getItem(storageKey);
    let pages: RecentPage[] = stored ? JSON.parse(stored) : [];
    // Remove existing entry for this href
    pages = pages.filter((p) => p.href !== href);
    // Add to front
    pages.unshift({ href, label, visitedAt: Date.now() });
    // Trim
    pages = pages.slice(0, MAX_RECENT);
    sessionStorage.setItem(storageKey, JSON.stringify(pages));
  } catch {
    // ignore
  }
}
