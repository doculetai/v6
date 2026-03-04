"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface EarningsPanelProps {
  invitesSent: number
  converted: number
  pendingPayout: number
  totalPaidOut: number
  currency: string
  className?: string
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount)
}

function EarningsPanel({
  invitesSent,
  converted,
  pendingPayout,
  totalPaidOut,
  currency,
  className,
}: EarningsPanelProps) {
  const rate = invitesSent > 0 ? Math.round((converted / invitesSent) * 100) : 0
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${rate}%`
    }
  }, [rate])

  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {rate}%
        </span>
        <span className="text-sm text-muted-foreground">Conversion rate</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div ref={progressRef} className="h-full rounded-full bg-primary transition-all duration-300 ease-out" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pending payout</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(pendingPayout, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total paid out</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(totalPaidOut, currency)}
          </span>
        </div>
      </div>
    </div>
  )
}

export { EarningsPanel }
export type { EarningsPanelProps }
