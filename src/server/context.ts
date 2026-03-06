import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { db } from '@/db';
import { env } from '@/lib/env';

export type CreateTRPCContextOptions = { req?: Request };

export async function createTRPCContext(opts?: CreateTRPCContextOptions) {
  const req = opts?.req;
  const ip =
    req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req?.headers.get('x-real-ip') ??
    null;
  const userAgent = req?.headers.get('user-agent') ?? null;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes are not always available in Server Components.
          }
        },
      },
    },
  );

  // getUser() validates the JWT server-side (unlike getSession which trusts the cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Also grab the session for access_token (used for session identification, not auth)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    db,
    supabase,
    session: user ? { user, access_token: session?.access_token ?? null } : null,
    user: user ?? null,
    ip: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
