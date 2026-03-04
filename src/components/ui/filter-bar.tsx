"use client"

import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Input } from "./input"

interface FilterChip {
  key: string
  label: string
  count?: number
}

interface FilterBarProps {
  query: string
  queryPlaceholder?: string
  chips: FilterChip[]
  activeChip: string
  onQueryChange?: (value: string) => void
  onChipChange?: (key: string) => void
  actions?: React.ReactNode
  className?: string
}

function FilterBar({
  query,
  queryPlaceholder = "Search...",
  chips,
  activeChip,
  onQueryChange,
  onChipChange,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-3", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            placeholder={queryPlaceholder}
            className="pl-9"
            aria-label={queryPlaceholder}
          />
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      <div
        className="mt-3 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter options"
      >
        {chips.map((chip) => {
          const isActive = chip.key === activeChip
          return (
            <Button
              key={chip.key}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="h-9"
              onClick={() => onChipChange?.(chip.key)}
              role="tab"
              aria-selected={isActive}
            >
              <span>{chip.label}</span>
              {typeof chip.count === "number" ? (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 text-xs",
                    isActive ? "bg-background/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {chip.count}
                </span>
              ) : null}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export { FilterBar }
export type { FilterBarProps, FilterChip }
