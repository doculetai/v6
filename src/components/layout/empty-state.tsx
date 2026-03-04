import { primitivesCopy } from "@/config/copy/primitives"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  icon?: React.ReactNode
  illustration?: React.ReactNode
  size?: "inline" | "card" | "page"
  onReset?: () => void
  resetLabel?: string
}

function EmptyState({
  title,
  description,
  action,
  className,
  icon,
  illustration,
  size = "card",
  onReset,
  resetLabel = primitivesCopy.labels.clearFilters,
}: EmptyStateProps) {
  if (size === "inline") {
    return (
      <div className={cn("flex items-center gap-3 py-4 text-sm text-muted-foreground", className)}>
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div>
          <span className="font-medium text-foreground">{title}</span>
          {description ? <span className="ml-1">{description}</span> : null}
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto rounded text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
    )
  }

  if (size === "page") {
    return (
      <div
        className={cn(
          "flex min-h-[50vh] flex-col items-center justify-center px-6 text-center",
          className,
        )}
      >
        {illustration ? <div className="mb-6">{illustration}</div> : null}
        {!illustration && icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-2 w-full max-w-md text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-4 rounded text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      {illustration ? <div className="mb-4">{illustration}</div> : null}
      {!illustration && icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description ? <p className="mt-1 w-full max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 rounded text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {resetLabel}
        </button>
      ) : null}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
