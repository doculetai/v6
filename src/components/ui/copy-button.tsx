"use client"

import * as React from "react"
import { Copy, Check } from '@/components/icons'

import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"

function CopyButton({
  value,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children" | "onClick"> & {
  value: string
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }, [value])

  return (
    <IconButton
      data-slot="copy-button"
      variant="ghost"
      size="icon-xs"
      tooltip={copied ? "Copied" : "Copy to clipboard"}
      className={cn(className)}
      onClick={handleCopy}
      {...props}
    >
      {copied ? (
        <Check weight="duotone" className="size-3.5 text-success" />
      ) : (
        <Copy weight="duotone" className="size-3.5" />
      )}
    </IconButton>
  )
}

export { CopyButton }
