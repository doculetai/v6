"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

interface MaskedValueProps {
  value: string
  label?: string
  className?: string
}

function MaskedValue({ value, label, className }: MaskedValueProps) {
  const [revealed, setRevealed] = useState(false)

  const masked = value.length > 4
    ? "\u2022".repeat(value.length - 4) + value.slice(-4)
    : "\u2022".repeat(6)

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <span aria-live="polite" className="font-medium tabular-nums">
        {revealed ? value : masked}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={revealed ? "Hide value" : "Show value"}
      >
        {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </span>
  )
}

export { MaskedValue }
export type { MaskedValueProps }
