import { cn } from "@/lib/utils"

type MoneyDisplay = "full" | "compact"

interface MoneyValueProps {
  /** Amount in minor units (kobo). E.g. 150000 = ₦1,500.00 */
  amountMinor: number
  display?: MoneyDisplay
  showCode?: boolean
  className?: string
}

function MoneyValue({
  amountMinor,
  display = "full",
  showCode = true,
  className,
}: MoneyValueProps) {
  const amountMajor = amountMinor / 100

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: display === "full" ? 2 : 0,
    maximumFractionDigits: display === "full" ? 2 : 1,
    notation: display === "compact" ? "compact" : "standard",
    compactDisplay: "short",
  }).format(amountMajor)

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      {showCode ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          NGN
        </span>
      ) : null}
      <span className="font-semibold tabular-nums text-foreground">{formattedAmount}</span>
    </span>
  )
}

export { MoneyValue }
export type { MoneyValueProps, MoneyDisplay }
