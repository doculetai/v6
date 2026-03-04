import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { db } from '@/db';
import { env } from '@/lib/env';

export async function createTRPCContext() {
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { db, supabase, session, user: session?.user ?? null };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
