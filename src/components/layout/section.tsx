import * as React from "react"
import {
  bgClasses,
  paddingClasses,
  borderClasses,
  type SectionBg,
  type SectionPadding,
  type SectionBorder,
} from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

interface SectionProps extends React.ComponentPropsWithoutRef<"section"> {
  bg?: SectionBg
  padding?: SectionPadding
  border?: SectionBorder
  as?: React.ElementType
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ bg = "default", padding = "lg", border = "none", as: Tag = "section", className, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "transition-colors",
        bgClasses[bg],
        paddingClasses[padding],
        borderClasses[border],
        className,
      )}
      {...props}
    />
  ),
)
Section.displayName = "Section"

export { Section, type SectionProps }
