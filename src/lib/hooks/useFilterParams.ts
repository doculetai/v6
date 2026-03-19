'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Syncs filter state to URL query parameters.
 * Provides a stable getter and setter that reads/writes from searchParams.
 *
 * Usage:
 *   const { filters, setFilter, clearFilters } = useFilterParams(['status', 'search']);
 *   filters.status   // string | null
 *   setFilter('status', 'active')
 *   clearFilters()
 */
export function useFilterParams<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => {
    const result = {} as Record<K, string | null>;
    for (const key of keys) {
      result[key] = searchParams.get(key);
    }
    return result;
  }, [searchParams, keys]);

  const setFilter = useCallback(
    (key: K, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
