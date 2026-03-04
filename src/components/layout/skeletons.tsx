import * as React from "react"
import {
  bgClasses,
  paddingClasses,
  gapClasses,
  colClasses,
  type SectionBg,
  type SectionPadding,
  type GapSize,
  type GridCols,
} from "@/components/layout/tokens"
import { cn } from "@/lib/utils"

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-muted/60", className)} aria-hidden />
  )
}

interface SectionSkeletonProps {
  bg?: SectionBg
  padding?: SectionPadding
  className?: string
}

function SectionSkeleton({ bg = "muted", padding = "lg", className }: SectionSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse transition-colors",
        bgClasses[bg],
        paddingClasses[padding],
        className,
      )}
      aria-hidden
    />
  )
}

interface GridSkeletonProps {
  cols?: GridCols
  gap?: GapSize
  count?: number
  cardHeight?: string
  className?: string
}

function GridSkeleton({
  cols = 3,
  gap = "md",
  count = 3,
  cardHeight = "h-32",
  className,
}: GridSkeletonProps) {
  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} className={cardHeight} />
      ))}
    </div>
  )
}

interface StackSkeletonProps {
  gap?: GapSize
  count?: number
  lineHeight?: string
  className?: string
}

function StackSkeleton({
  gap = "sm",
  count = 3,
  lineHeight = "h-4",
  className,
}: StackSkeletonProps) {
  return (
    <div className={cn("flex flex-col", gapClasses[gap], className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock
          key={i}
          className={cn(lineHeight, i === count - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  )
}

export {
  SkeletonBlock,
  SectionSkeleton,
  GridSkeleton,
  StackSkeleton,
}
