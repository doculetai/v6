"use client"

import { Desktop, DeviceMobile, DeviceTablet, Question } from "@/components/icons"
import { primitivesCopy } from "@/config/copy/primitives"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  browser: string
  deviceType: "desktop" | "mobile" | "tablet" | "unknown"
  location: string
  lastActive: string
  isCurrent: boolean
  ipAddress?: string
}

export interface SessionManagementProps {
  sessions: Session[]
  isLoading?: boolean
  error?: string | null
  feedback?: string | null
  showIpAddress?: boolean
  onRevoke?: (sessionId: string) => void
  onRevokeAll?: () => void
  className?: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const copy = primitivesCopy.sessionManagement

const DEVICE_ICONS = {
  desktop: Desktop,
  mobile: DeviceMobile,
  tablet: DeviceTablet,
  unknown: Question,
} as const

const BROWSER_LABELS: Record<string, string> = {
  Chrome: copy.browsers.Chrome,
  Safari: copy.browsers.Safari,
  Firefox: copy.browsers.Firefox,
  Edge: copy.browsers.Edge,
  Opera: copy.browsers.Opera,
  Unknown: copy.browsers.Unknown,
}

const DEVICE_TYPE_LABELS: Record<Session["deviceType"], string> = {
  desktop: copy.devices.desktop,
  mobile: copy.devices.mobile,
  tablet: copy.devices.tablet,
  unknown: copy.devices.unknown,
}

// ── Sub-components ───────────────────────────────────────────────────────────

function DeviceIcon({ deviceType }: { deviceType: Session["deviceType"] }) {
  const Icon = DEVICE_ICONS[deviceType]
  const label = DEVICE_TYPE_LABELS[deviceType]

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
      aria-label={label}
    >
      <Icon size={20} weight="duotone" className="text-muted-foreground" />
    </div>
  )
}

function CurrentBadge() {
  return (
    <span
      aria-label={copy.thisDevice}
      className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
    >
      {copy.thisDevice}
    </span>
  )
}

interface SessionCardProps {
  session: Session
  showIpAddress: boolean
  onRevoke?: (sessionId: string) => void
}

function SessionCard({ session, showIpAddress, onRevoke }: SessionCardProps) {
  const browserLabel = BROWSER_LABELS[session.browser] ?? session.browser

  return (
    <div
      aria-label={copy.activeSession}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors duration-150",
        session.isCurrent && "border-success/30 bg-success/5",
      )}
    >
      <DeviceIcon deviceType={session.deviceType} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{browserLabel}</span>
          {session.isCurrent ? <CurrentBadge /> : null}
        </div>

        <p className="text-xs text-muted-foreground">{session.location}</p>
        <p className="text-xs text-muted-foreground">
          {copy.lastActive}: {session.lastActive}
        </p>

        {showIpAddress && session.ipAddress ? (
          <p className="font-mono text-xs text-muted-foreground">{session.ipAddress}</p>
        ) : null}
      </div>

      {!session.isCurrent && onRevoke ? (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          aria-label={copy.revokeSession}
          className="min-h-11 min-w-11 shrink-0 rounded-md px-3 text-sm font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copy.revoke}
        </button>
      ) : null}
    </div>
  )
}

function NoOtherSessionsNotice() {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted-foreground">{copy.noOtherSessions}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label={copy.loading}>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg bg-muted"
        />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function SessionManagement({
  sessions,
  isLoading = false,
  error = null,
  feedback = null,
  showIpAddress = false,
  onRevoke,
  onRevokeAll,
  className,
}: SessionManagementProps) {
  const otherSessions = sessions.filter((s) => !s.isCurrent)
  const hasOtherSessions = otherSessions.length > 0

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 text-card-foreground shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{copy.title}</h2>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      {/* Feedback / error banners */}
      {error ? (
        <p role="alert" className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {feedback && !error ? (
        <p role="status" className="mb-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {feedback}
        </p>
      ) : null}

      {/* Session list */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              showIpAddress={showIpAddress}
              onRevoke={onRevoke}
            />
          ))}
        </div>
      )}

      {/* Empty state — no other sessions */}
      {!isLoading && !hasOtherSessions ? <NoOtherSessionsNotice /> : null}

      {/* Revoke all button */}
      {!isLoading && hasOtherSessions && onRevokeAll ? (
        <div className="mt-4 border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={onRevokeAll}
            className="min-h-11 w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.signOutAllOthers}
          </button>
        </div>
      ) : null}
    </div>
  )
}
