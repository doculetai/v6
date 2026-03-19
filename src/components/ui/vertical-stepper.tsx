"use client"

import * as React from "react"
import { CheckCircle, Circle, XCircle } from '@/components/icons'

import { cn } from "@/lib/utils"
import { primitivesCopy } from '@/config/copy/primitives'

type VerticalStepStatus = "completed" | "current" | "upcoming" | "error"

interface VerticalStepperStep {
  label: string
  description?: string
  status: VerticalStepStatus
  content?: React.ReactNode
}

interface VerticalStepperProps {
  steps: VerticalStepperStep[]
  className?: string
}

function stepIcon(status: VerticalStepStatus) {
  if (status === "completed") {
    return (
      <CheckCircle
        weight="duotone"
        className="size-5 text-primary"
        aria-hidden="true"
      />
    )
  }
  if (status === "error") {
    return (
      <XCircle
        weight="duotone"
        className="size-5 text-destructive"
        aria-hidden="true"
      />
    )
  }
  if (status === "current") {
    return (
      <Circle
        weight="duotone"
        className="size-5 text-primary"
        aria-hidden="true"
      />
    )
  }
  return (
    <Circle
      weight="duotone"
      className="size-5 text-muted-foreground"
      aria-hidden="true"
    />
  )
}

function VerticalStepper({ steps, className }: VerticalStepperProps) {
  return (
    <ol
      data-slot="vertical-stepper"
      className={cn("flex flex-col", className)}
      aria-label={primitivesCopy.ariaExtended.progressSteps}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const showContent =
          step.content &&
          (step.status === "completed" || step.status === "current")

        return (
          <li
            key={index}
            className="relative flex gap-3"
            aria-current={step.status === "current" ? "step" : undefined}
          >
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <span className="mt-0.5 shrink-0">{stepIcon(step.status)}</span>
              {!isLast && (
                <span
                  className={cn(
                    "mt-1 w-px flex-1 min-h-4",
                    step.status === "completed" ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
              <span
                className={cn(
                  "block text-sm",
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
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {step.description}
                </span>
              )}
              {showContent && <div className="mt-2">{step.content}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { VerticalStepper }
export type { VerticalStepperStep, VerticalStepperProps, VerticalStepStatus }
