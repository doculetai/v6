import * as React from "react"
import Link from "next/link"
import { ArrowSquareOut } from '@/components/icons'

import { cn } from "@/lib/utils"
import { Button, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

function LinkButton({
  href,
  external,
  className,
  children,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "ref"> &
  VariantProps<typeof buttonVariants> & {
    external?: boolean
  }) {
  return (
    <Button
      data-slot="link-button"
      variant={variant}
      size={size}
      asChild
      className={cn(className)}
    >
      <Link
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      >
        {children}
        {external && <ArrowSquareOut weight="duotone" className="size-4" />}
      </Link>
    </Button>
  )
}

export { LinkButton }
