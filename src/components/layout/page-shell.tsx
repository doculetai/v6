import { cn } from "@/lib/utils"
import { gapClasses, type GapSize } from "@/components/layout/tokens"

export type PageWidth = "default" | "narrow" | "form" | "wide" | "full"

const pageWidthMap: Record<PageWidth, string> = {
  full: "",
  default: "max-w-7xl",
  wide: "max-w-5xl",
  narrow: "max-w-3xl",
  form: "max-w-[520px]",
}

interface PageShellProps extends React.ComponentPropsWithoutRef<"div"> {
  narrow?: boolean
  width?: PageWidth
  gap?: GapSize
}

function PageShell({ children, className, narrow, width, gap, ...rest }: PageShellProps) {
  const resolvedWidth = width ?? (narrow ? "narrow" : "default")
  return (
    <div
      className={cn(
        "mx-auto w-full",
        pageWidthMap[resolvedWidth],
        "flex flex-col",
        gap ? gapClasses[gap] : gapClasses.md,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export { PageShell }
export type { PageShellProps }
