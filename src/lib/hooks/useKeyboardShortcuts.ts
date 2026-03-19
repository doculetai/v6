'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import type { DashboardRole } from '@/config/roles';
import { routes } from '@/config/routes';

type ShortcutDef = {
  /** Single key or chord: ['g', 'o'] means press G then O */
  keys: string[];
  action: () => void;
};

const CHORD_TIMEOUT_MS = 500;

/**
 * Global keyboard shortcuts for dashboard navigation.
 *
 * Chords: G then O → Overview, G then S → Students, G then T → Settings
 * Single: / → focus search (open command palette via Cmd+K)
 *
 * Ignores input when user is focused on an input, textarea, or contentEditable.
 */
export function useKeyboardShortcuts(role: DashboardRole) {
  const router = useRouter();
  const pendingKey = useRef<string | null>(null);
  const chordTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const navigate = useCallback(
    (path: string) => router.push(routes.dashboard.rolePath(role, path)),
    [router, role],
  );

  useEffect(() => {
    const shortcuts: ShortcutDef[] = [
      { keys: ['g', 'o'], action: () => navigate('') },
      { keys: ['g', 's'], action: () => navigate('students') },
      { keys: ['g', 't'], action: () => navigate('settings') },
      { keys: ['g', 'd'], action: () => navigate('documents') },
      { keys: ['g', 'a'], action: () => navigate('activity') },
    ];

    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if any modifier is held (except shift)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Check for chord completion
      if (pendingKey.current) {
        const first = pendingKey.current;
        pendingKey.current = null;
        clearTimeout(chordTimer.current);

        const match = shortcuts.find(
          (s) => s.keys.length === 2 && s.keys[0] === first && s.keys[1] === key,
        );
        if (match) {
          e.preventDefault();
          match.action();
          return;
        }
      }

      // Start a chord if this key begins one
      const startsChord = shortcuts.some(
        (s) => s.keys.length === 2 && s.keys[0] === key,
      );
      if (startsChord) {
        pendingKey.current = key;
        chordTimer.current = setTimeout(() => {
          pendingKey.current = null;
        }, CHORD_TIMEOUT_MS);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(chordTimer.current);
    };
  }, [navigate]);
}
