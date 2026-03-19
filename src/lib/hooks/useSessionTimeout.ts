'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000; // show warning 5 min before logout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;
const STORAGE_KEY = 'doculet-last-activity';

/**
 * Tracks user idle time and triggers a warning before session timeout.
 * Returns { showWarning, remainingSeconds, dismiss }.
 */
export function useSessionTimeout(onTimeout: () => void) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const warningTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);

    // Persist last activity across tabs
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor(WARNING_BEFORE_MS / 1000));

      countdownInterval.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      logoutTimer.current = setTimeout(() => {
        onTimeout();
      }, WARNING_BEFORE_MS);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
  }, [clearTimers, onTimeout]);

  const dismiss = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    resetTimers();

    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [resetTimers, clearTimers, showWarning]);

  return { showWarning, remainingSeconds, dismiss };
}
