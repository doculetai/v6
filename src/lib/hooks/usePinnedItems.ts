'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'doculet-pinned-nav';
const MAX_PINS = 3;

/**
 * Manages pinned/favorite navigation items per role.
 * Stored in localStorage. Max 3 items.
 */
export function usePinnedItems(role: string) {
  const storageKey = `${STORAGE_KEY}-${role}`;
  const [pinnedHrefs, setPinnedHrefs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) setPinnedHrefs(parsed.slice(0, MAX_PINS));
      }
    } catch {
      // ignore corrupt data
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setPinnedHrefs(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const togglePin = useCallback(
    (href: string) => {
      setPinnedHrefs((prev) => {
        if (prev.includes(href)) {
          const next = prev.filter((h) => h !== href);
          persist(next);
          return next;
        }
        if (prev.length >= MAX_PINS) return prev; // silently refuse
        const next = [...prev, href];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isPinned = useCallback(
    (href: string) => pinnedHrefs.includes(href),
    [pinnedHrefs],
  );

  return { pinnedHrefs, togglePin, isPinned, maxReached: pinnedHrefs.length >= MAX_PINS };
}
