// Layout system design tokens
// Shared across Section, Container, Grid, Stack, and pattern components

// ── Gap scale (t-shirt sizes) ──────────────────────────────────

export const gapClasses = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
} as const
export type GapSize = keyof typeof gapClasses

// ── Container widths ───────────────────────────────────────────

export const widthClasses = {
  xs: "max-w-sm",
  sm: "max-w-[520px]",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[72rem]",
  full: "",
} as const
export type ContainerWidth = keyof typeof widthClasses

export const WIDTHS = {
  auth: "xs",
  form: "sm",
  narrow: "md",
  wide: "lg",
  dashboard: "xl",
  landing: "2xl",
  full: "full",
} as const satisfies Record<string, ContainerWidth>

// ── Section backgrounds ────────────────────────────────────────

export const bgClasses = {
  default: "bg-background",
  surface: "bg-[var(--color-surface)]",
  surfaceContainer: "bg-[var(--color-surface-container)]",
  muted: "bg-muted/30",
  primary: "bg-primary text-primary-foreground",
  card: "bg-card",
  none: "",
} as const
export type SectionBg = keyof typeof bgClasses

// ── Section padding ────────────────────────────────────────────

export const paddingClasses = {
  none: "",
  sm: "py-8 sm:py-10",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-20",
  xl: "py-20 sm:py-24",
} as const
export type SectionPadding = keyof typeof paddingClasses

// ── Section borders ────────────────────────────────────────────

export const borderClasses = {
  none: "",
  top: "border-t border-border",
  bottom: "border-b border-border",
  both: "border-y border-border",
} as const
export type SectionBorder = keyof typeof borderClasses

// ── Grid columns ───────────────────────────────────────────────

export const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12",
} as const
export type GridCols = keyof typeof colClasses

export const breakpointColClasses = {
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" },
  xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" },
} as const

// ── Alignment ──────────────────────────────────────────────────

export const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const

export const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const

// ── Icon sizes ─────────────────────────────────────────────────

export const iconSizeClasses = {
  nav: "h-6 w-6",
  inline: "h-5 w-5",
  sm: "h-4 w-4",
} as const
export type IconSize = keyof typeof iconSizeClasses
