import type { SemanticTokens, Theme } from '@/config/themes/types';

// camelCase → kebab-case (e.g. cardForeground → card-foreground)
function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

// SemanticTokens keys that map directly to shadcn CSS vars (--background, --primary, etc.)
const SHADCN_KEYS: (keyof SemanticTokens)[] = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'border',
  'input',
  'ring',
];

function semanticVars(tokens: SemanticTokens): string[] {
  const lines: string[] = [];

  for (const key of SHADCN_KEYS) {
    lines.push(`  --${toKebab(key)}: ${tokens[key]};`);
  }

  // Extended tokens — not in shadcn's set, use --color- prefix
  lines.push(`  --color-success: ${tokens.success};`);
  lines.push(`  --color-warning: ${tokens.warning};`);

  return lines;
}

function chartVars(tokens: SemanticTokens, neutral: string, success: string, warning: string): string[] {
  return [
    `  --chart-1: ${tokens.primary};`,
    `  --chart-2: ${tokens.accent};`,
    `  --chart-3: ${success};`,
    `  --chart-4: ${warning};`,
    `  --chart-5: ${neutral};`,
  ];
}

function sidebarVars(tokens: SemanticTokens, mode: 'light' | 'dark'): string[] {
  if (mode === 'light') {
    return [
      `  --sidebar: ${tokens.primary};`,
      `  --sidebar-foreground: ${tokens.primaryForeground};`,
      `  --sidebar-primary: ${tokens.primary};`,
      `  --sidebar-primary-foreground: ${tokens.primaryForeground};`,
      `  --sidebar-accent: rgba(255, 255, 255, 0.12);`,
      `  --sidebar-accent-foreground: ${tokens.primaryForeground};`,
      `  --sidebar-border: rgba(255, 255, 255, 0.15);`,
      `  --sidebar-ring: ${tokens.ring};`,
    ];
  }

  return [
    `  --sidebar: ${tokens.card};`,
    `  --sidebar-foreground: ${tokens.foreground};`,
    `  --sidebar-primary: ${tokens.primary};`,
    `  --sidebar-primary-foreground: ${tokens.primaryForeground};`,
    `  --sidebar-accent: ${tokens.secondary};`,
    `  --sidebar-accent-foreground: ${tokens.secondaryForeground};`,
    `  --sidebar-border: ${tokens.border};`,
    `  --sidebar-ring: ${tokens.ring};`,
  ];
}

function colorScaleVars(theme: Theme): string[] {
  const lines: string[] = [];

  for (const [scaleName, scale] of Object.entries(theme.colors)) {
    for (const [stop, value] of Object.entries(scale)) {
      lines.push(`  --color-${scaleName}-${stop}: ${value};`);
    }
  }

  return lines;
}

function radiusVars(theme: Theme): string[] {
  return [
    `  --radius: ${theme.radius.lg};`, // base radius used by shadcn
    `  --radius-sm: ${theme.radius.sm};`,
    `  --radius-md: ${theme.radius.md};`,
    `  --radius-lg: ${theme.radius.lg};`,
    `  --radius-xl: ${theme.radius.xl};`,
    `  --radius-2xl: ${theme.radius['2xl']};`,
    `  --radius-full: ${theme.radius.full};`,
  ];
}

function shadowVars(theme: Theme): string[] {
  return [
    `  --shadow-xs: ${theme.shadows.xs};`,
    `  --shadow-sm: ${theme.shadows.sm};`,
    `  --shadow-md: ${theme.shadows.md};`,
    `  --shadow-lg: ${theme.shadows.lg};`,
    `  --shadow-xl: ${theme.shadows.xl};`,
    `  --shadow-2xl: ${theme.shadows['2xl']};`,
  ];
}

function durationVars(theme: Theme): string[] {
  return [
    `  --duration-micro: ${theme.duration.micro};`,
    `  --duration-fast: ${theme.duration.fast};`,
    `  --duration-normal: ${theme.duration.normal};`,
    `  --duration-slow: ${theme.duration.slow};`,
    `  --duration-slower: ${theme.duration.slower};`,
  ];
}

function layoutVars(theme: Theme): string[] {
  return [
    `  --sidebar-width: ${theme.layout.sidebarWidth};`,
    `  --header-height: ${theme.layout.headerHeight};`,
    `  --content-max-width: ${theme.layout.contentMaxWidth};`,
  ];
}

/**
 * Converts a Theme object into a complete CSS string with :root and .dark blocks.
 * The output is injected by ThemeProvider at runtime, making theme swapping trivial.
 */
export function themeToCss(theme: Theme): string {
  const lightNeutral = theme.colors.neutral[500];
  const darkNeutral = theme.colors.neutral[400];
  const lightSuccess = theme.colors.success[500] ?? theme.light.success;
  const darkSuccess = theme.colors.success[400] ?? theme.dark.success;
  const lightWarning = theme.colors.warning[500] ?? theme.light.warning;
  const darkWarning = theme.colors.warning[400] ?? theme.dark.warning;

  const rootLines = [
    '  /* Color scales */',
    ...colorScaleVars(theme),
    '',
    '  /* Semantic tokens — shadcn compat */',
    ...semanticVars(theme.light),
    '',
    '  /* Derived: chart + sidebar */',
    ...chartVars(theme.light, lightNeutral, lightSuccess, lightWarning),
    ...sidebarVars(theme.light, 'light'),
    '',
    '  /* Radius */',
    ...radiusVars(theme),
    '',
    '  /* Shadows */',
    ...shadowVars(theme),
    '',
    '  /* Motion */',
    ...durationVars(theme),
    '',
    '  /* Layout */',
    ...layoutVars(theme),
  ];

  const darkLines = [
    ...semanticVars(theme.dark),
    '',
    ...chartVars(theme.dark, darkNeutral, darkSuccess, darkWarning),
    ...sidebarVars(theme.dark, 'dark'),
  ];

  return `:root {\n${rootLines.join('\n')}\n}\n\n.dark {\n${darkLines.join('\n')}\n}\n`;
}
