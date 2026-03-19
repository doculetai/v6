import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health check endpoint. Returns 200 if DB is reachable.
 * Use for load balancer / k8s liveness.
 */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: 'ok', db: 'reachable' });
  } catch {
    return NextResponse.json(
      { status: 'error', db: 'unreachable' },
      { status: 503 },
    );
  }
}
