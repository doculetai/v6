/**
 * Design Tokens — Single Source of Truth
 *
 * Reference: docs/plans/2026-03-04-enterprise-design-component-framework.md §3.1
 *
 * All UI uses tokens only — never raw values like #abc123, 18px, or arbitrary Tailwind.
 * Re-exports layout tokens, icon sizes, and typography helpers.
 */

// Layout tokens (gap, width, padding, etc.)
export {
  gapClasses,
  widthClasses,
  bgClasses,
  paddingClasses,
  borderClasses,
  colClasses,
  alignClasses,
  justifyClasses,
  WIDTHS,
  iconSizeClasses,
  type GapSize,
  type ContainerWidth,
  type SectionBg,
  type SectionPadding,
  type SectionBorder,
  type GridCols,
  type IconSize,
} from "@/components/layout/tokens"

// Icon sizes — unified (hero/display from iconography, nav/inline/sm from tokens)
export { ICON_SIZES } from "@/config/iconography"

// Typography helpers — semantic text size presets
export const textStyles = {
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium text-foreground",
  body: "text-base text-foreground",
  bodySecondary: "text-sm text-muted-foreground",
  heading1: "text-4xl font-bold tracking-tight text-foreground",
  heading2: "text-3xl font-bold tracking-tight text-foreground",
  heading3: "text-2xl font-semibold text-foreground",
  heading4: "text-xl font-semibold text-foreground",
  heading5: "text-lg font-medium text-foreground",
} as const

// Radius scale (Tailwind classes)
export const radiusClasses = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const

// Shadow scale
export const shadowClasses = {
  xs: "shadow-xs",
  sm: "shadow-sm",
  default: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const

/**
 * Semantic color token names — correspond to Tailwind utility classes.
 * Usage: bg-{token}, text-{token}, border-{token}
 * e.g. bg-background, text-muted-foreground, bg-success, text-role-accent
 */
export const colorTokens = [
  "background",
  "foreground",
  "card",
  "popover",
  "primary",
  "primary-foreground",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "success",
  "warning",
  "gold",
  "role-accent",
  "role-accent-bg",
] as const
