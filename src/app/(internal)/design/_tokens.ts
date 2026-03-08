export const colorTokens = [
  { name: 'background', label: 'Background' },
  { name: 'foreground', label: 'Foreground', dark: true },
  { name: 'card', label: 'Card' },
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary Fg', dark: true },
  { name: 'secondary', label: 'Secondary' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted Fg', dark: true },
  { name: 'accent', label: 'Accent' },
  { name: 'border', label: 'Border' },
  { name: 'destructive', label: 'Destructive' },
  { name: 'color-success', label: 'Success' },
  { name: 'color-warning', label: 'Warning' },
  { name: 'ring', label: 'Ring' },
];

export const colorScales = [
  { name: 'Brand', prefix: 'brand', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { name: 'Neutral', prefix: 'neutral', stops: ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] },
  { name: 'Error', prefix: 'error', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { name: 'Success', prefix: 'success', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { name: 'Warning', prefix: 'warning', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
];

export const roleAccents = [
  { role: 'Student', color: '#2B39A3' },
  { role: 'Sponsor', color: '#15803D' },
  { role: 'University', color: '#0369A1' },
  { role: 'Admin', color: '#C2410C' },
  { role: 'Agent', color: '#6D28D9' },
  { role: 'Partner', color: '#0F766E' },
];

export const semanticTokens = [
  { name: 'background' },
  { name: 'foreground' },
  { name: 'card' },
  { name: 'primary' },
  { name: 'primary-foreground' },
  { name: 'secondary' },
  { name: 'muted' },
  { name: 'muted-foreground' },
  { name: 'accent' },
  { name: 'border' },
  { name: 'destructive' },
  { name: 'ring' },
  { name: 'color-success' },
  { name: 'color-warning' },
];

export const sidebarTokens = [
  { name: 'sidebar', label: 'Base' },
  { name: 'sidebar-foreground', label: 'Fg' },
  { name: 'sidebar-primary', label: 'Primary' },
  { name: 'sidebar-primary-foreground', label: 'Pri Fg' },
  { name: 'sidebar-accent', label: 'Accent' },
  { name: 'sidebar-accent-foreground', label: 'Acc Fg' },
  { name: 'sidebar-border', label: 'Border' },
  { name: 'sidebar-ring', label: 'Ring' },
];

export const chartTokens = [
  { name: 'chart-1', label: 'Chart 1' },
  { name: 'chart-2', label: 'Chart 2' },
  { name: 'chart-3', label: 'Chart 3' },
  { name: 'chart-4', label: 'Chart 4' },
  { name: 'chart-5', label: 'Chart 5' },
];

export const typographyScale = [
  { cssVar: '--text-heading-2', name: 'Heading 2', size: '20px', lineHeight: '24px', weight: '500', letterSpacing: '0em' },
  { cssVar: '--text-heading-3', name: 'Heading 3', size: '16px', lineHeight: '20px', weight: '500', letterSpacing: '0em' },
  { cssVar: '--text-body-bold', name: 'Body Bold', size: '14px', lineHeight: '20px', weight: '500', letterSpacing: '0em' },
  { cssVar: '--text-body', name: 'Body', size: '14px', lineHeight: '20px', weight: '400', letterSpacing: '0em' },
  { cssVar: '--text-caption-bold', name: 'Caption Bold', size: '12px', lineHeight: '16px', weight: '500', letterSpacing: '0em' },
  { cssVar: '--text-caption', name: 'Caption', size: '12px', lineHeight: '16px', weight: '400', letterSpacing: '0em' },
  { cssVar: '--text-mono', name: 'Mono (amounts)', size: '14px', lineHeight: '20px', weight: '400', letterSpacing: '0em', mono: true },
];

export const borderTokens = {
  widths: [
    { name: 'Default', value: '1px', cssVar: '--border-width' },
    { name: 'Medium', value: '2px', cssVar: '--border-width-md' },
  ],
  colors: [
    { name: 'Border', cssVar: '--border' },
    { name: 'Border / 40%', cssVar: '--border' },
    { name: 'Input', cssVar: '--input' },
    { name: 'Ring', cssVar: '--ring' },
  ],
};

export const radiusTokens = [
  { name: 'sm', value: '8px' },
  { name: 'md / DEFAULT', value: '16px' },
  { name: 'lg', value: '24px' },
  { name: 'full', value: '9999px' },
];

export const shadowTokens = [
  { name: 'sm', label: 'Small', cssVar: '--shadow-sm', usage: 'Inline elements, badges' },
  { name: 'default', label: 'Default', cssVar: '--shadow-default', usage: 'Cards, dropdowns' },
  { name: 'md', label: 'Medium', cssVar: '--shadow-md', usage: 'Modals, popovers' },
  { name: 'lg', label: 'Large', cssVar: '--shadow-lg', usage: 'Sidesheets, elevated panels' },
  { name: 'overlay', label: 'Overlay', cssVar: '--shadow-overlay', usage: 'Full-screen overlays' },
];
