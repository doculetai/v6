"use client"

import { primitivesCopy } from "@/config/copy/primitives"
import { cn } from "@/lib/utils"

export type DisbursementStage = "initiated" | "processing" | "cleared" | "disbursed" | "confirmed"

const STAGES: Array<{ id: DisbursementStage; label: string }> = [
  { id: "initiated", label: primitivesCopy.disbursementFlow.initiated },
  { id: "processing", label: primitivesCopy.disbursementFlow.processing },
  { id: "cleared", label: primitivesCopy.disbursementFlow.cleared },
  { id: "disbursed", label: primitivesCopy.disbursementFlow.disbursed },
  { id: "confirmed", label: primitivesCopy.disbursementFlow.confirmed },
]

export interface DisbursementFlowProps {
  currentStage: DisbursementStage;
  className?: string;
}

export function DisbursementFlow({ currentStage, className }: DisbursementFlowProps): React.JSX.Element {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <ol
      className={cn("flex items-center gap-0", className)}
      aria-label={primitivesCopy.aria.disbursementProgress}
    >
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <li
            key={stage.id}
            className="flex flex-1 flex-col items-center gap-1"
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Connector + dot row */}
            <div className="flex w-full items-center">
              {/* Left connector */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  index === 0 && "invisible",
                  isCompleted || isCurrent ? "bg-primary" : "bg-border",
                )}
              />
              {/* Dot */}
              <div
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full border-2",
                  isCompleted && "border-primary bg-primary",
                  isCurrent && "border-primary bg-background",
                  isUpcoming && "border-border bg-background",
                )}
              />
              {/* Right connector */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  index === STAGES.length - 1 && "invisible",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            </div>
            {/* Label */}
            <span
              className={cn(
                "text-xs font-medium",
                isCompleted && "text-success-high-contrast",
                isCurrent && "text-foreground font-semibold",
                isUpcoming && "text-muted-foreground",
              )}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
