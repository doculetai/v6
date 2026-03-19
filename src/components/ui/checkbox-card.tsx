"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxCardProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  title: string
  description?: string
  disabled?: boolean
  className?: string
}

function CheckboxCard({
  checked,
  onCheckedChange,
  title,
  description,
  disabled,
  className,
}: CheckboxCardProps) {
  const id = React.useId()

  return (
    <label
      data-slot="checkbox-card"
      htmlFor={id}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200",
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-background hover:bg-muted/30",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">
          {title}
        </span>
        {description && (
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

export { CheckboxCard }
export type { CheckboxCardProps }
