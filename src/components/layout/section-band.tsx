import * as React from "react"
import { Container } from "@/components/layout/container"
import {
  bgClasses,
  paddingClasses,
  type SectionBg,
  type SectionPadding,
} from "@/components/layout/tokens"
import type { ContainerWidth } from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

export type SectionBandVariant = "default" | "muted" | "primary" | "gradient"

const bandVariants: Record<SectionBandVariant, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  primary: "bg-primary text-primary-foreground",
  gradient: "bg-gradient-to-b from-primary-950 to-primary-900 text-primary-foreground",
}

interface SectionBandProps extends React.ComponentPropsWithoutRef<"section"> {
  variant?: SectionBandVariant | SectionBg
  padding?: SectionPadding
  containerWidth?: ContainerWidth
  contentClassName?: string
}

const SectionBand = React.forwardRef<HTMLElement, SectionBandProps>(
  ({ variant = "default", padding = "lg", containerWidth = "xl", contentClassName, className, children, ...props }, ref) => {
    const bgClass =
      variant === "default" || variant === "muted" || variant === "primary" || variant === "gradient"
        ? bandVariants[variant as SectionBandVariant]
        : bgClasses[variant as SectionBg]
    return (
      <section
        ref={ref}
        className={cn("w-full transition-colors", paddingClasses[padding], bgClass, className)}
        {...props}
      >
        <Container width={containerWidth} className={contentClassName}>
          {children}
        </Container>
      </section>
    )
  },
)
SectionBand.displayName = "SectionBand"

export { SectionBand }
