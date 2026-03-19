import { useEffect, useState } from 'react';

/**
 * Debounces a value by the given delay in milliseconds.
 * Returns the debounced value which updates only after the delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
