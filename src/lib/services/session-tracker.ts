import { createHash } from "crypto"

import { and, desc, eq, gte, ne } from "drizzle-orm"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionRecord {
  id: string
  user_id: string
  device_name: string | null
  browser: string | null
  os: string | null
  ip_address: string | null
  fingerprint: string | null
  location: string | null
  is_current: boolean
  last_active_at: string
  created_at: string
}

interface DeviceInfo {
  deviceName: string
  browser: string
  os: string
}

// ---------------------------------------------------------------------------
// Pure helpers — no DB, no env vars, fully testable
// ---------------------------------------------------------------------------

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 64)
}

export function parseUserAgent(ua: string): DeviceInfo {
  let browser = "Unknown"
  let os = "Unknown"
  let deviceName = "Unknown device"

  // OS detection
  if (ua.includes("iPhone")) { os = "iOS"; deviceName = "iPhone" }
  else if (ua.includes("iPad")) { os = "iPadOS"; deviceName = "iPad" }
  else if (ua.includes("Android")) { os = "Android"; deviceName = "Android device" }
  else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) { os = "macOS"; deviceName = "Mac" }
  else if (ua.includes("Windows")) { os = "Windows"; deviceName = "Windows PC" }
  else if (ua.includes("Linux")) { os = "Linux"; deviceName = "Linux PC" }
  else if (ua.includes("CrOS")) { os = "ChromeOS"; deviceName = "Chromebook" }

  // Browser detection (order matters — check specific before generic)
  if (ua.includes("Edg/")) browser = "Edge"
  else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera"
  else if (ua.includes("Chrome/") && !ua.includes("Edg/")) browser = "Chrome"
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari"
  else if (ua.includes("Firefox/")) browser = "Firefox"

  return { deviceName, browser, os }
}

export function generateFingerprint(
  ua: string,
  ip: string,
  acceptLanguage: string,
  secChUa?: string,
  acceptEncoding?: string,
): string {
  const raw = `${ua}|${ip}|${acceptLanguage}|${secChUa ?? ""}|${acceptEncoding ?? ""}`
  return createHash("sha256").update(raw).digest("hex").slice(0, 32)
}

export function extractLocation(headers: Headers): string | null {
  const city = headers.get("x-vercel-ip-city")
  const country = headers.get("x-vercel-ip-country")
  if (city && country) return `${decodeURIComponent(city)}, ${country}`
  if (country) return country
  return null
}

export function extractIP(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = headers.get("x-real-ip")
  if (realIp) return realIp
  return null
}

// ---------------------------------------------------------------------------
// Row mapping — Drizzle returns camelCase, SessionRecord uses snake_case
// ---------------------------------------------------------------------------

type UserSessionRow = {
  id: string
  userId: string
  sessionTokenHash: string
  deviceName: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  fingerprint: string | null
  location: string | null
  isCurrent: boolean
  lastActiveAt: Date
  createdAt: Date
}

function toSessionRecord(row: UserSessionRow): SessionRecord {
  return {
    id: row.id,
    user_id: row.userId,
    device_name: row.deviceName,
    browser: row.browser,
    os: row.os,
    ip_address: row.ipAddress,
    fingerprint: row.fingerprint,
    location: row.location,
    is_current: row.isCurrent,
    last_active_at: row.lastActiveAt.toISOString(),
    created_at: row.createdAt.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// DB-backed functions — Drizzle queries
// ---------------------------------------------------------------------------

async function getDB() {
  const { db } = await import("@/db")
  const { userSessions } = await import("@/db/schema")
  return { db, userSessions }
}

export async function trackLogin(
  userId: string,
  request: Request,
  accessToken: string,
): Promise<SessionRecord | null> {
  try {
    const { db, userSessions } = await getDB()
    const headers = new Headers(request.headers)
    const ua = headers.get("user-agent") ?? ""
    const ip = extractIP(headers)
    const acceptLang = headers.get("accept-language") ?? ""
    const secChUa = headers.get("sec-ch-ua") ?? ""
    const acceptEncoding = headers.get("accept-encoding") ?? ""
    const location = extractLocation(headers)
    const tokenHash = hashToken(accessToken)
    const { deviceName, browser, os } = parseUserAgent(ua)
    const fingerprint = generateFingerprint(ua, ip ?? "unknown", acceptLang, secChUa, acceptEncoding)
    const now = new Date()

    const [row] = await db
      .insert(userSessions)
      .values({
        userId,
        sessionTokenHash: tokenHash,
        deviceName,
        browser,
        os,
        ipAddress: ip ?? undefined,
        fingerprint,
        location,
        isCurrent: true,
        lastActiveAt: now,
      })
      .onConflictDoUpdate({
        target: userSessions.sessionTokenHash,
        set: {
          isCurrent: true,
          lastActiveAt: now,
          ipAddress: ip ?? undefined,
          location,
        },
      })
      .returning()

    return row ? toSessionRecord(row) : null
  } catch {
    return null
  }
}

export async function isNewFingerprint(
  userId: string,
  fingerprint: string,
): Promise<boolean> {
  try {
    const { db, userSessions } = await getDB()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const rows = await db
      .select({ id: userSessions.id })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.fingerprint, fingerprint),
          gte(userSessions.lastActiveAt, thirtyDaysAgo),
        ),
      )
      .limit(1)

    return rows.length === 0
  } catch {
    return false
  }
}

export async function heartbeat(userId: string, tokenHash: string): Promise<void> {
  try {
    const { db, userSessions } = await getDB()
    const now = new Date()
    await db
      .update(userSessions)
      .set({ lastActiveAt: now })
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.sessionTokenHash, tokenHash),
        ),
      )
  } catch {
    // Non-blocking — silently fail
  }
}

export async function endSession(userId: string, tokenHash: string): Promise<void> {
  try {
    const { db, userSessions } = await getDB()
    await db
      .delete(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.sessionTokenHash, tokenHash),
        ),
      )
  } catch {
    // Non-blocking — silently fail
  }
}

export async function terminateSession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  try {
    const { db, userSessions } = await getDB()
    await db
      .delete(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.id, sessionId)))
    return true
  } catch {
    return false
  }
}

export async function terminateAllOtherSessions(
  userId: string,
  currentTokenHash: string,
): Promise<number> {
  try {
    const { db, userSessions } = await getDB()
    const deleted = await db
      .delete(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          ne(userSessions.sessionTokenHash, currentTokenHash),
        ),
      )
      .returning({ id: userSessions.id })

    return deleted.length
  } catch {
    return 0
  }
}

export async function getActiveSessions(userId: string): Promise<SessionRecord[]> {
  try {
    const { db, userSessions } = await getDB()
    const rows = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastActiveAt))
    return rows.map(toSessionRecord)
  } catch {
    return []
  }
}