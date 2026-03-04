import type { Theme } from './types';

export const doculetTheme: Theme = {
  name: 'doculet',
  displayName: 'Doculet',
  description: 'Obsidian Blues — authoritative, premium, trustworthy fintech aesthetic',

  colors: {
    // Obsidian Blues: Navy → Violet → Periwinkle → Midnight
    primary: {
      50: '#EDEDFF',
      100: '#D0D0FF',
      200: '#A8A8FF',
      300: '#8080FF',
      400: '#6060E0',
      500: '#4747D4',
      600: '#2E2EB3',
      700: '#1A1A99',
      800: '#000080',
      900: '#0C1266',
      950: '#0E0E55',
    },
    // Cool Slate (blue undertone)
    neutral: {
      50: '#F7F7FB',
      100: '#EEEFF4',
      200: '#DDDEE8',
      300: '#BCBED1',
      400: '#9295B3',
      500: '#6B6F94',
      600: '#4A4D73',
      700: '#2D305A',
      800: '#1E2040',
      900: '#14152A',
      950: '#0D0E1F',
    },
    // Emerald Green (money / verified)
    success: {
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
    },
    // Amber
    warning: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    // Red
    destructive: {
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    // Periwinkle scale
    accent: {
      100: '#EDEDFF',
      200: '#D0D0FF',
      300: '#B3B3FF',
      400: '#9999FF',
      500: '#8080FF',
      600: '#4747D4',
    },
  },

  // Light mode: off-white page, deep navy brand
  light: {
    background: '#FAFAFA',
    foreground: '#14152A',
    card: '#ffffff',
    cardForeground: '#14152A',
    primary: '#000080',
    primaryForeground: '#ffffff',
    secondary: '#EEEFF4',
    secondaryForeground: '#14152A',
    muted: '#EEEFF4',
    mutedForeground: '#4A4D73',
    accent: '#8080FF',
    accentForeground: '#0E0E55',
    destructive: '#dc2626',
    border: '#DDDEE8',
    input: '#DDDEE8',
    ring: '#8080FF',
    success: '#10B981',
    warning: '#f59e0b',
  },

  // Dark mode: deep navy bg, periwinkle becomes primary
  dark: {
    background: 'hsl(240 72% 19%)',
    foreground: 'hsl(235 60% 95%)',
    card: 'hsl(240 68% 24%)',
    cardForeground: 'hsl(235 60% 95%)',
    primary: 'hsl(240 100% 75%)',
    primaryForeground: 'hsl(240 72% 19%)',
    secondary: 'hsl(240 65% 28%)',
    secondaryForeground: 'hsl(235 60% 90%)',
    muted: 'hsl(240 65% 28%)',
    mutedForeground: 'hsl(236 20% 77%)',
    accent: 'hsl(240 62% 55%)',
    accentForeground: 'hsl(235 60% 95%)',
    destructive: 'hsl(0 62% 50%)',
    border: 'hsl(238 38% 36%)',
    input: 'hsl(238 38% 36%)',
    ring: 'hsl(240 100% 85%)',
    success: '#34D399',
    warning: '#fbbf24',
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

  // Midnight-tinted shadows (rgb(14 14 85) = #0E0E55)
  shadows: {
    xs: '0 1px 2px 0 rgb(14 14 85 / 0.04)',
    sm: '0 1px 3px 0 rgb(14 14 85 / 0.06), 0 1px 2px -1px rgb(14 14 85 / 0.04)',
    md: '0 4px 6px -1px rgb(14 14 85 / 0.08), 0 2px 4px -2px rgb(14 14 85 / 0.05)',
    lg: '0 10px 15px -3px rgb(14 14 85 / 0.10), 0 4px 6px -4px rgb(14 14 85 / 0.06)',
    xl: '0 20px 25px -5px rgb(14 14 85 / 0.10), 0 8px 10px -6px rgb(14 14 85 / 0.06)',
    '2xl': '0 1px 2px rgb(14 14 85 / 0.03), 0 4px 8px rgb(14 14 85 / 0.04), 0 12px 24px rgb(14 14 85 / 0.06), 0 32px 64px rgb(14 14 85 / 0.08)',
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
