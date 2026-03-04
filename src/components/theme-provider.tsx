'use client';

import { useCallback, useContext, useEffect, useMemo, createContext, useState } from 'react';

import type { Theme } from '@/config/themes/types';
import { themeToCss } from '@/lib/theme-to-css';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
  isDark: boolean;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {},
  isDark: false,
  theme: {} as Theme,
});

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('doculet-theme-mode');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  // Inject theme CSS vars into <head> via style.textContent (XSS-safe, no innerHTML)
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'doculet-theme';
    style.textContent = themeToCss(theme);
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  // Apply .dark class to <html> and persist preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('doculet-theme-mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ mode, toggleMode, isDark: mode === 'dark', theme }),
    [mode, toggleMode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
