"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioCardGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-card-group"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
}

function RadioCardItem({
  className,
  value,
  title,
  description,
  icon,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> & {
  title: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-card-item"
      value={value}
      disabled={disabled}
      className={cn(
        "group flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary/5",
        "data-[state=unchecked]:border-border data-[state=unchecked]:bg-background data-[state=unchecked]:hover:bg-muted/30",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <div className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-border shadow-xs transition-colors group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground">
        <RadioGroupPrimitive.Indicator className="grid place-content-center">
          <span className="block size-2 rounded-full bg-current" />
        </RadioGroupPrimitive.Indicator>
      </div>
      {icon && (
        <span className="mt-0.5 shrink-0 text-muted-foreground group-data-[state=checked]:text-primary [&>svg]:size-5">
          {icon}
        </span>
      )}
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
    </RadioGroupPrimitive.Item>
  )
}

export { RadioCardGroup, RadioCardItem }
