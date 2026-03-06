import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';
import { env } from '@/lib/env';

const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };

// prepare: false required for Supabase Transaction mode pooler
// max: 1 for serverless — each Lambda/Edge invocation gets a single connection
const client = globalForDb._pgClient ?? postgres(env.DATABASE_URL, { prepare: false, max: 1 });
if (process.env.NODE_ENV !== 'production') {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });
export type DrizzleDB = typeof db;
