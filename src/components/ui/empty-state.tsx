import { Inbox } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
}

interface EmptyStateProps {
  heading: string
  body: string
  action?: EmptyStateAction
  illustration?: React.ReactNode
  className?: string
}

function EmptyState({ heading, body, action, illustration, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-12 px-4", className)}>
      {illustration ? (
        <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] flex items-center justify-center">
          {illustration}
        </div>
      ) : (
        <Inbox size={48} className="text-muted-foreground/50" aria-hidden="true" />
      )}

      <h3 className="text-base font-semibold text-foreground mt-4">{heading}</h3>

      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{body}</p>

      {action ? (
        <div className="mt-4">
          {action.href ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps, EmptyStateAction }
