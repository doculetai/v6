"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const resolvedValue = value ?? defaultValue ?? [min]

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      {resolvedValue.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className="block size-5 rounded-full border-2 border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
