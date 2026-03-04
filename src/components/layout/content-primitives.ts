// Content layout primitives (Section, Container, Grid, Stack, etc.)
// Use these for page content; DashboardShell/Sidebar/TopBar remain for shell layout.

export { Section, type SectionProps } from "./section"
export { SectionBand, type SectionBandVariant } from "./section-band"
export { Container, type ContainerProps } from "./container"
export { Grid, type GridProps } from "./grid"
export { Stack, type StackProps } from "./stack"
export { ContentSection, type ContentSectionProps } from "./content-section"
export { PageHeader, type PageHeaderProps, type Breadcrumb } from "./page-header"
export { PageShell, type PageShellProps, type PageWidth } from "./page-shell"
export { EmptyState, type EmptyStateProps } from "./empty-state"
export {
  SkeletonBlock,
  SectionSkeleton,
  GridSkeleton,
  StackSkeleton,
} from "./skeletons"

// Tokens (for custom layout composition)
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
  type GapSize,
  type ContainerWidth,
  type SectionBg,
  type SectionPadding,
  type SectionBorder,
  type GridCols,
} from "./tokens"
