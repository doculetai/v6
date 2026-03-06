'use client';

import Link from "next/link"
import { CaretLeft, CaretRight, Question } from "@phosphor-icons/react"
import { useState } from "react"
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
  /** Optional help text shown in a popover when ? icon is clicked */
  helpText?: string
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
  helpText,
}: PageHeaderProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 pb-4",
        sticky && "sticky top-0 z-30 bg-background border-b border-border",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <>
          {/* Mobile: show "< Parent" back link */}
          <MobileBackLink breadcrumbs={breadcrumbs} />

          {/* Desktop: full breadcrumb trail */}
          <nav className="mb-2 hidden items-center gap-1 text-sm text-muted-foreground sm:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 ? <CaretRight weight="duotone" className="h-3.5 w-3.5" /> : null}
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
        </>
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {helpText && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHelpOpen((p) => !p)}
                    aria-label="Page help"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Question className="size-4" weight="duotone" />
                  </button>
                  {helpOpen && (
                    <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-lg border border-border bg-card p-3 shadow-lg sm:w-80">
                      <p className="text-sm text-muted-foreground">{helpText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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

function MobileBackLink({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  // Find the last breadcrumb with an href (the parent page)
  const parent = [...breadcrumbs].reverse().find((c) => c.href)
  if (!parent?.href) return null

  return (
    <nav className="mb-2 sm:hidden" aria-label="Back">
      <Link
        href={parent.href}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <CaretLeft weight="duotone" className="h-3.5 w-3.5" />
        <span>{parent.label}</span>
      </Link>
    </nav>
  )
}

export { PageHeader, type PageHeaderProps, type Breadcrumb }
