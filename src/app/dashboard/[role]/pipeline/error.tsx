"use client"

import { AlertTriangle } from "lucide-react"

import { universityCopy } from "@/config/copy/university"
import { Button } from "@/components/ui/button"

interface PipelineErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PipelineError({ error, reset }: PipelineErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          {universityCopy.errors.generic}
        </h2>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">{error.digest}</p>
        ) : null}
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        {universityCopy.errors.retry}
      </Button>
    </div>
  )
}
