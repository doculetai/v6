"use client"

import { cn } from "@/lib/utils"

export interface CommitmentEvent {
  id: string
  label: string
  amount: number
  currency: string
  date: string
  status: "created" | "signed" | "active" | "fulfilled" | "cancelled"
}

interface CommitmentTimelineProps {
  events: CommitmentEvent[]
  emptyLabel?: string
}

const statusDot: Record<CommitmentEvent["status"], string> = {
  created: "bg-primary/60",
  signed: "bg-[var(--color-warning)]",
  active: "bg-[var(--color-success)]",
  fulfilled: "bg-[var(--color-success)]",
  cancelled: "bg-destructive",
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

export function CommitmentTimeline({ events, emptyLabel }: CommitmentTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel ?? "No commitment history"}
      </p>
    )
  }

  return (
    <ol className="relative space-y-6 border-l-2 border-border pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span
            className={cn(
              "absolute -left-[31px] top-1 size-3 rounded-full ring-2 ring-background",
              statusDot[event.status],
            )}
          />
          <p className="text-sm font-medium text-foreground">{event.label}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(event.amount, event.currency)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
        </li>
      ))}
    </ol>
  )
}
