import type { LucideIcon } from "lucide-react"
import { iconography } from "@/config/iconography"

interface IconAuditProps {
  size?: "sm" | "md" | "lg"
}

const sizeClassMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const

// Flatten nested iconography into key → Icon pairs for display
function flattenIconography(): Array<{ key: string; Icon: LucideIcon }> {
  const entries: Array<{ key: string; Icon: LucideIcon }> = []
  for (const [group, icons] of Object.entries(iconography)) {
    for (const [name, Icon] of Object.entries(icons as Record<string, LucideIcon>)) {
      entries.push({ key: `${group}.${name}`, Icon })
    }
  }
  return entries
}

function IconAudit({ size = "md" }: IconAuditProps) {
  const icons = flattenIconography()

  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-lg font-semibold text-foreground">Icon Audit</h2>
      <p className="mt-1 text-sm text-muted-foreground">Canonical semantic icon mapping for enterprise routes.</p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {icons.map(({ key, Icon }) => (
          <div key={key} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
            <Icon className={sizeClassMap[size]} aria-hidden="true" />
            <code className="text-xs text-muted-foreground">{key}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

export { IconAudit }
export type { IconAuditProps }
