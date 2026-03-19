'use client';

import { useEffect } from 'react';

/**
 * Shows browser-native "unsaved changes" confirmation when the user
 * tries to close or navigate away from a page with dirty form state.
 *
 * Usage:
 *   useUnsavedChanges(form.formState.isDirty);
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
