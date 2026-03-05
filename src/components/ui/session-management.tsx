"use client"

import { Monitor, Smartphone, Tablet, HelpCircle } from "lucide-react"

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
  showIpAddress?: boolean
  onRevoke?: (sessionId: string) => void
  onRevokeAll?: () => void
  className?: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: HelpCircle,
} as const

const BROWSER_LABELS: Record<string, string> = {
  Chrome: primitivesCopy.sessionManagement.browsers.Chrome,
  Safari: primitivesCopy.sessionManagement.browsers.Safari,
  Firefox: primitivesCopy.sessionManagement.browsers.Firefox,
  Edge: primitivesCopy.sessionManagement.browsers.Edge,
  Opera: primitivesCopy.sessionManagement.browsers.Opera,
  Unknown: primitivesCopy.sessionManagement.browsers.Unknown,
}

const DEVICE_TYPE_LABELS: Record<Session["deviceType"], string> = {
  desktop: primitivesCopy.sessionManagement.devices.desktop,
  mobile: primitivesCopy.sessionManagement.devices.mobile,
  tablet: primitivesCopy.sessionManagement.devices.tablet,
  unknown: primitivesCopy.sessionManagement.devices.unknown,
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
      <Icon size={20} className="text-muted-foreground" />
    </div>
  )
}

function CurrentBadge() {
  const label = primitivesCopy.sessionManagement.thisDevice
  return (
    <span
      aria-label={label}
      className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
    >
      {label}
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
      aria-label={primitivesCopy.sessionManagement.activeSession}
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
        <p className="text-xs text-muted-foreground">{primitivesCopy.sessionManagement.lastActive}: {session.lastActive}</p>

        {showIpAddress && session.ipAddress ? (
          <p className="font-mono text-xs text-muted-foreground">{session.ipAddress}</p>
        ) : null}
      </div>

      {!session.isCurrent && onRevoke ? (
        <button
          type="button"
          onClick={() => onRevoke(session.id)}
          aria-label="Revoke session"
          className="min-h-11 min-w-11 shrink-0 rounded-md px-3 text-sm font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Revoke
        </button>
      ) : null}
    </div>
  )
}

function NoOtherSessionsNotice() {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted-foreground">
        {primitivesCopy.sessionManagement.noOtherSessions}
      </p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function SessionManagement({
  sessions,
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
        <h2 className="text-base font-semibold text-foreground">Active Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Devices and browsers currently signed in to your account.
        </p>
      </div>

      {/* Session list */}
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

      {/* Empty state — no other sessions */}
      {!hasOtherSessions ? <NoOtherSessionsNotice /> : null}

      {/* Revoke all button */}
      {hasOtherSessions && onRevokeAll ? (
        <div className="mt-4 border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={onRevokeAll}
            className="min-h-11 w-full rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {primitivesCopy.sessionManagement.signOutAllOthers}
          </button>
        </div>
      ) : null}
    </div>
  )
}

// SessionManagementProps is exported inline above via `export interface`
