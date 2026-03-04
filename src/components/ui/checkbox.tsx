"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-[18px] w-[18px] shrink-0 rounded-[5px] border border-[#AEBBDB] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1FF] focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#0E1A3B] data-[state=checked]:bg-[#0E1A3B] data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
