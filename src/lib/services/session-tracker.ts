import { createHash } from "crypto"

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
// DB-backed functions — use Drizzle via dynamic import to stay edge-safe
// ---------------------------------------------------------------------------

async function getDB() {
  const { db } = await import("@/db")
  return db
}

export async function trackLogin(
  userId: string,
  request: Request,
  accessToken: string,
): Promise<SessionRecord | null> {
  try {
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
    const now = new Date().toISOString()

    const db = await getDB()
    const { sql } = await import("drizzle-orm")

    // Upsert via raw SQL — user_sessions table uses session_token_hash as conflict key
    const result = await db.execute(sql`
      INSERT INTO user_sessions
        (user_id, session_token_hash, device_name, browser, os, ip_address,
         fingerprint, location, is_current, last_active_at, created_at)
      VALUES
        (${userId}, ${tokenHash}, ${deviceName}, ${browser}, ${os}, ${ip},
         ${fingerprint}, ${location}, true, ${now}, ${now})
      ON CONFLICT (session_token_hash) DO UPDATE SET
        is_current     = true,
        last_active_at = ${now},
        ip_address     = EXCLUDED.ip_address,
        location       = EXCLUDED.location
      RETURNING *
    `)

    const row = (result as unknown as { rows: SessionRecord[] }).rows[0]
    return row ?? null
  } catch {
    return null
  }
}

export async function isNewFingerprint(
  userId: string,
  fingerprint: string,
): Promise<boolean> {
  try {
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await db.execute(sql`
      SELECT id FROM user_sessions
      WHERE user_id = ${userId}
        AND fingerprint = ${fingerprint}
        AND last_active_at >= ${thirtyDaysAgo}
      LIMIT 1
    `)

    const rows = (result as unknown as { rows: unknown[] }).rows
    return !rows || rows.length === 0
  } catch {
    return false
  }
}

export async function heartbeat(userId: string, tokenHash: string): Promise<void> {
  try {
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    const now = new Date().toISOString()
    await db.execute(sql`
      UPDATE user_sessions
      SET last_active_at = ${now}
      WHERE user_id = ${userId}
        AND session_token_hash = ${tokenHash}
    `)
  } catch {
    // Non-blocking — silently fail
  }
}

export async function endSession(userId: string, tokenHash: string): Promise<void> {
  try {
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    await db.execute(sql`
      DELETE FROM user_sessions
      WHERE user_id = ${userId}
        AND session_token_hash = ${tokenHash}
    `)
  } catch {
    // Non-blocking — silently fail
  }
}

export async function terminateSession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  try {
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    await db.execute(sql`
      DELETE FROM user_sessions
      WHERE user_id = ${userId}
        AND id = ${sessionId}
    `)
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
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    const result = await db.execute(sql`
      DELETE FROM user_sessions
      WHERE user_id = ${userId}
        AND session_token_hash != ${currentTokenHash}
      RETURNING id
    `)
    const rows = (result as unknown as { rows: unknown[] }).rows
    return rows?.length ?? 0
  } catch {
    return 0
  }
}

export async function getActiveSessions(userId: string): Promise<SessionRecord[]> {
  try {
    const db = await getDB()
    const { sql } = await import("drizzle-orm")
    const result = await db.execute(sql`
      SELECT * FROM user_sessions
      WHERE user_id = ${userId}
      ORDER BY last_active_at DESC
    `)
    const rows = (result as unknown as { rows: SessionRecord[] }).rows
    return rows ?? []
  } catch {
    return []
  }
}
