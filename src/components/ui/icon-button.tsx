"use client"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type IconButtonSize = "icon-xs" | "icon-sm" | "icon" | "icon-lg"

function IconButton({
  tooltip,
  className,
  variant = "ghost",
  size = "icon",
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "size"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    tooltip: string
    size?: IconButtonSize
  }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="icon-button"
          variant={variant}
          size={size}
          className={cn(className)}
          aria-label={tooltip}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export { IconButton }
