import * as React from "react"

import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  meta?: React.ReactNode
}

function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  meta,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
        {meta ? <div className="text-xs text-muted-foreground sm:text-sm">{meta}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 self-start">{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
export type { PageHeaderProps }
