import { dashboardRoles, ROLE_ACCENTS } from '@/config/roles';
import { roleDisplayNames } from '@/config/copy/dashboard-shell';

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
  { name: 'success', label: 'Success' },
  { name: 'warning', label: 'Warning' },
  { name: 'ring', label: 'Ring' },
];

// Prefixes match @theme vars in globals.css — var(--color-{prefix}-{stop})
export const colorScales = [
  { name: 'Primary', prefix: 'primary', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] },
  { name: 'Neutral', prefix: 'neutral', stops: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] },
  { name: 'Success', prefix: 'success', stops: ['200', '300', '400', '500', '600'] },
  { name: 'Warning', prefix: 'warning', stops: ['400', '500', '600'] },
  { name: 'Destructive', prefix: 'destructive', stops: ['400', '500', '600'] },
];

// Derived from canonical ROLE_ACCENTS — no duplication.
export const roleAccents = dashboardRoles.map((role) => ({
  role: roleDisplayNames[role],
  color: ROLE_ACCENTS[role].text,
  bg: ROLE_ACCENTS[role].bg,
}));

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
  { name: 'success' },
  { name: 'warning' },
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

// Values match --radius-* in globals.css :root
export const radiusTokens = [
  { name: 'sm', cssVar: '--radius-sm', value: '6px' },
  { name: 'md', cssVar: '--radius-md', value: '8px' },
  { name: 'lg', cssVar: '--radius-lg', value: '12px' },
  { name: 'xl', cssVar: '--radius-xl', value: '16px' },
  { name: '2xl', cssVar: '--radius-2xl', value: '24px' },
  { name: 'full', cssVar: '--radius-full', value: '9999px' },
];

// cssVars match --shadow-* in globals.css :root
export const shadowTokens = [
  { name: 'xs', label: 'XS', cssVar: '--shadow-xs', usage: 'Badges, status chips' },
  { name: 'sm', label: 'Small', cssVar: '--shadow-sm', usage: 'Inline elements, nav items' },
  { name: 'md', label: 'Medium', cssVar: '--shadow-md', usage: 'Cards, dropdowns' },
  { name: 'lg', label: 'Large', cssVar: '--shadow-lg', usage: 'Modals, sidesheets' },
  { name: 'xl', label: 'XL', cssVar: '--shadow-xl', usage: 'Elevated panels, drawers' },
  { name: '2xl', label: '2XL', cssVar: '--shadow-2xl', usage: 'Full-screen overlays' },
];
