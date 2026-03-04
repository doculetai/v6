import { CheckCircle2, Clock3, Info, TriangleAlert, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

import { TimestampLabel } from "./timestamp-label"

export type ActivityTone = "neutral" | "success" | "warning" | "error" | "info"

export interface ActivityTimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string
  tone?: ActivityTone
}

interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
  emptyLabel?: string
  className?: string
}

const toneDotClass: Record<ActivityTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
  info: "bg-primary",
}

function toneIcon(tone: ActivityTone): React.ReactNode {
  if (tone === "success") return <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
  if (tone === "warning") return <TriangleAlert className="size-4 text-amber-600 dark:text-amber-400" />
  if (tone === "error") return <XCircle className="size-4 text-destructive" />
  if (tone === "info") return <Info className="size-4 text-primary" />
  return <Clock3 className="size-4 text-muted-foreground" />
}

function ActivityTimeline({
  items,
  emptyLabel = "No activity yet.",
  className,
}: ActivityTimelineProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-card p-4 text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <ol className={cn("space-y-0", className)} aria-label="Activity timeline">
      {sorted.map((item, index) => {
        const tone = item.tone ?? "neutral"
        const isLast = index === sorted.length - 1

        return (
          <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn("mt-1.5 h-2.5 w-2.5 rounded-full", toneDotClass[tone])}
                aria-hidden="true"
              />
              {!isLast ? <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2">
                {toneIcon(tone)}
                <p className="text-sm font-medium text-foreground">{item.title}</p>
              </div>
              {item.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              ) : null}
              <TimestampLabel className="mt-1 block text-xs" value={item.timestamp} mode="both" />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export { ActivityTimeline }
export type { ActivityTimelineProps }
