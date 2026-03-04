import * as React from "react"
import { gapClasses, type GapSize } from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

interface ContentSectionProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string
  description?: string
  action?: React.ReactNode
  gap?: GapSize
}

const ContentSection = React.forwardRef<HTMLDivElement, ContentSectionProps>(
  ({ title, description, action, gap = "sm", className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", gapClasses[gap], className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  ),
)
ContentSection.displayName = "ContentSection"

export { ContentSection, type ContentSectionProps }
