import type { Theme } from './types';

export const doculetTheme: Theme = {
  name: 'doculet',
  displayName: 'Doculet',
  description: 'Civic — authoritative, premium, trustworthy fintech aesthetic',

  colors: {
    // Deep Navy → Electric Blue
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#0A1628',
    },
    // Cool Slate
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    // Green (verified/money)
    success: {
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#16A34A',
      600: '#15803D',
    },
    // Amber
    warning: {
      400: '#FBBF24',
      500: '#D97706',
      600: '#B45309',
    },
    // Red
    destructive: {
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
    },
    // Blue accent scale
    accent: {
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
    },
  },

  // Light mode
  light: {
    background: '#FDFCFA',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    secondary: '#F1F5F9',
    secondaryForeground: '#0F172A',
    muted: '#F1F5F9',
    mutedForeground: '#475569',
    accent: '#3B82F6',
    accentForeground: '#0A1628',
    destructive: '#DC2626',
    border: '#E2E8F0',
    input: '#E2E8F0',
    ring: '#3B82F6',
    success: '#16A34A',
    warning: '#D97706',
    gold: '#D4A853',
  },

  // Dark mode: deep navy
  dark: {
    background: '#0A1628',
    foreground: '#F1F5F9',
    card: '#0D1F3C',
    cardForeground: '#F1F5F9',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#1E293B',
    secondaryForeground: '#E2E8F0',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    accent: '#2563EB',
    accentForeground: '#F1F5F9',
    destructive: '#EF4444',
    border: '#1E293B',
    input: '#1E293B',
    ring: '#3B82F6',
    success: '#4ADE80',
    warning: '#FBBF24',
    gold: '#D4A853',
  },

  fonts: {
    sans: "'IBM Plex Sans', sans-serif",
    serif: "'IBM Plex Serif', serif",
    mono: "'IBM Plex Mono', monospace",
  },

  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Navy-tinted shadows (rgb(10 22 40) = #0A1628)
  shadows: {
    xs: '0 1px 2px 0 rgb(10 22 40 / 0.04)',
    sm: '0 1px 3px 0 rgb(10 22 40 / 0.06), 0 1px 2px -1px rgb(10 22 40 / 0.04)',
    md: '0 4px 6px -1px rgb(10 22 40 / 0.08), 0 2px 4px -2px rgb(10 22 40 / 0.05)',
    lg: '0 10px 15px -3px rgb(10 22 40 / 0.10), 0 4px 6px -4px rgb(10 22 40 / 0.06)',
    xl: '0 20px 25px -5px rgb(10 22 40 / 0.10), 0 8px 10px -6px rgb(10 22 40 / 0.06)',
    '2xl': '0 1px 2px rgb(10 22 40 / 0.03), 0 4px 8px rgb(10 22 40 / 0.04), 0 12px 24px rgb(10 22 40 / 0.06), 0 32px 64px rgb(10 22 40 / 0.08)',
  },

  duration: {
    micro: '50ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
  },

  layout: {
    sidebarWidth: '240px',
    headerHeight: '56px',
    contentMaxWidth: '1280px',
  },
};
