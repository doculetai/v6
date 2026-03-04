"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface ControlToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  sortValue: string;
  onSortChange: (value: string) => void;
  className?: string;
}

export function ControlToolbar({
  query,
  onQueryChange,
  sortOptions,
  sortValue,
  onSortChange,
  className,
}: ControlToolbarProps) {
  return (
    <div className={cn("flex items-center gap-md", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search..."
          className="min-h-[44px] w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <select
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
        className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
