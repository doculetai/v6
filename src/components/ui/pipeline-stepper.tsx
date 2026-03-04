import { CheckCircle2, Circle, CircleDashed, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type PipelineStepStatus = "completed" | "current" | "upcoming" | "blocked" | "failed"

export interface PipelineStep {
  id: string
  label: string
  status: PipelineStepStatus
}

interface PipelineStepperProps {
  steps: PipelineStep[]
  className?: string
}

function statusIcon(status: PipelineStepStatus): React.ReactNode {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
  }
  if (status === "current") {
    return <Circle className="size-4 text-primary" aria-hidden="true" />
  }
  if (status === "failed") {
    return <XCircle className="size-4 text-destructive" aria-hidden="true" />
  }
  if (status === "blocked") {
    return <CircleDashed className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
  }
  return <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
}

function labelClass(status: PipelineStepStatus): string {
  if (status === "completed") return "text-foreground"
  if (status === "current") return "text-foreground font-medium"
  if (status === "failed") return "text-destructive"
  return "text-muted-foreground"
}

function PipelineStepper({ steps, className }: PipelineStepperProps) {
  return (
    <ol className={cn("flex flex-col gap-2", className)} aria-label="Pipeline steps">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li
            key={step.id}
            className="relative flex items-start gap-2"
            aria-current={step.status === "current" ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <span className="mt-0.5">{statusIcon(step.status)}</span>
              {!isLast ? <span className="mt-1 h-5 w-px bg-border" aria-hidden="true" /> : null}
            </div>
            <span className={cn("text-sm", labelClass(step.status))}>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export { PipelineStepper }
export type { PipelineStepperProps }
