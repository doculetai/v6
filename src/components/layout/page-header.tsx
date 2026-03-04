import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  overline?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  icon?: React.ComponentType<{ className?: string }>
  sticky?: boolean
}

function PageHeader({
  title,
  description,
  children,
  className,
  overline,
  subtitle,
  actions,
  breadcrumbs,
  icon: Icon,
  sticky = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-4",
        sticky && "sticky top-0 z-30 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="h-6 w-6 shrink-0 text-primary" /> : null}
          <div>
            {overline ? (
              <span className="mb-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {overline}
              </span>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {description ? <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {(actions || children) ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 shrink-0 sm:mt-0">{actions}{children}</div>
        ) : null}
      </div>
    </div>
  )
}

export { PageHeader, type PageHeaderProps, type Breadcrumb }
