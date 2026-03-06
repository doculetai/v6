'use client';

import * as React from "react"
import Link from "next/link"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  meta?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
}

function MobileBackLink({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
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

function PageHeader({
  title,
  subtitle,
  description,
  badge,
  actions,
  meta,
  breadcrumbs,
  className,
  ...props
}: PageHeaderProps) {
  const sub = subtitle ?? description;

  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-4",
        className,
      )}
      {...props}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <>
          <MobileBackLink breadcrumbs={breadcrumbs} />
          <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex" aria-label="Breadcrumb">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {sub ? <p className="text-sm text-muted-foreground sm:text-base">{sub}</p> : null}
          {meta ? <div className="text-xs text-muted-foreground sm:text-sm">{meta}</div> : null}
        </div>
        {actions ? <div className="flex items-center gap-2 self-start">{actions}</div> : null}
      </div>
    </header>
  )
}

export { PageHeader }
export type { PageHeaderProps, Breadcrumb }
