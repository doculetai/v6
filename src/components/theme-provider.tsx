'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');

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

  // Read stored preference or system preference on mount
  useEffect(() => {
    const stored = localStorage.getItem('doculet-theme-mode') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply .dark class to <html> and persist preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('doculet-theme-mode', mode);
  }, [mode]);

  function toggleMode() {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, isDark: mode === 'dark', theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
