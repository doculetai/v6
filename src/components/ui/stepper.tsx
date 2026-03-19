"use client"

import * as React from "react"
import { CheckCircle, XCircle } from '@/components/icons'

import { cn } from "@/lib/utils"
import { primitivesCopy } from '@/config/copy/primitives'

type StepStatus = "completed" | "current" | "upcoming" | "error"

interface StepperStep {
  label: string
  description?: string
  status: StepStatus
}

interface StepperProps {
  steps: StepperStep[]
  className?: string
}

function stepIcon(status: StepStatus, index: number) {
  if (status === "completed") {
    return (
      <CheckCircle
        weight="duotone"
        className="size-6 text-primary"
        aria-hidden="true"
      />
    )
  }
  if (status === "error") {
    return (
      <XCircle
        weight="duotone"
        className="size-6 text-destructive"
        aria-hidden="true"
      />
    )
  }
  if (status === "current") {
    return (
      <span
        className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
        aria-hidden="true"
      >
        {index + 1}
      </span>
    )
  }
  return (
    <span
      className="flex size-6 items-center justify-center rounded-full border-2 border-border text-xs font-medium text-muted-foreground"
      aria-hidden="true"
    >
      {index + 1}
    </span>
  )
}

function Stepper({ steps, className }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.status === "current")

  return (
    <>
      {/* Desktop: horizontal */}
      <ol
        data-slot="stepper"
        className={cn("hidden items-center sm:flex", className)}
        aria-label={primitivesCopy.ariaExtended.progressSteps}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          return (
            <li
              key={index}
              className={cn(
                "flex items-center",
                !isLast && "flex-1"
              )}
              aria-current={step.status === "current" ? "step" : undefined}
            >
              <div className="flex items-center gap-2">
                {stepIcon(step.status, index)}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm",
                      step.status === "current"
                        ? "font-medium text-foreground"
                        : step.status === "completed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-3 h-px flex-1",
                    step.status === "completed" ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile: compact */}
      <div
        data-slot="stepper-mobile"
        className={cn("flex items-center gap-2 sm:hidden", className)}
        role="status"
      >
        {stepIcon(
          steps[currentIndex]?.status ?? "upcoming",
          currentIndex >= 0 ? currentIndex : 0
        )}
        <span className="text-sm font-medium text-foreground">
          {`Step ${(currentIndex >= 0 ? currentIndex : 0) + 1} of ${steps.length}`}
        </span>
        {steps[currentIndex] && (
          <span className="text-sm text-muted-foreground">
            {steps[currentIndex].label}
          </span>
        )}
      </div>
    </>
  )
}

export { Stepper }
export type { StepperStep, StepperProps, StepStatus }
