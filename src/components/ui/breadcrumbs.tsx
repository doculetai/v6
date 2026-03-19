"use client"

import * as React from "react"
import Link from "next/link"
import { CaretRight, DotsThree } from '@/components/icons'
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { primitivesCopy } from "@/config/copy/primitives"

function Breadcrumbs({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="breadcrumbs"
      aria-label={primitivesCopy.ariaExtended.breadcrumbNavFull}
      className={className}
      {...props}
    />
  )
}

function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { asChild?: boolean }) {
  const linkClass = cn(
    "transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
    className
  )

  if (asChild) {
    return (
      <Slot.Root
        data-slot="breadcrumb-link"
        className={linkClass}
        {...(props as Record<string, unknown>)}
      />
    )
  }

  return (
    <Link
      data-slot="breadcrumb-link"
      className={linkClass}
      {...props}
    />
  )
}

function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3", className)}
      {...props}
    >
      {children ?? <CaretRight weight="duotone" />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <DotsThree weight="duotone" className="size-4" />
      <span className="sr-only">{primitivesCopy.ariaExtended.showPath}</span>
    </span>
  )
}

export {
  Breadcrumbs,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
