import { ShieldCheck } from "lucide-react"

import { universityCopy } from "@/config/copy/university"
import { cn } from "@/lib/utils"

interface UniversityPipelineTierBadgeProps {
  tier: number | null
  className?: string
}

const TIER_STYLES: Record<number, string> = {
  1: "bg-muted text-muted-foreground",
  2: "bg-primary/10 text-primary dark:bg-primary/20",
  3: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
}

function UniversityPipelineTierBadge({ tier, className }: UniversityPipelineTierBadgeProps) {
  if (tier === null) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const styles = TIER_STYLES[tier] ?? TIER_STYLES[1]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
    >
      {tier === 3 ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : null}
      {universityCopy.pipeline.tierLabel} {tier}
    </span>
  )
}

export { UniversityPipelineTierBadge }
export type { UniversityPipelineTierBadgeProps }
