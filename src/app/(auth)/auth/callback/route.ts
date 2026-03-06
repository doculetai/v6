import { createServerClient } from '@supabase/ssr';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { profiles } from '@/db/schema';
import { env } from '@/lib/env';

function isValidRedirectPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next') ?? '/auth/complete';
  const next = isValidRedirectPath(rawNext) ? rawNext : '/auth/complete';
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_missing_code`);
  }

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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_exchange_failed`);
  }

  if (data.session?.user?.id && data.session.access_token) {
    const { trackLogin } = await import('@/lib/services/session-tracker');
    await trackLogin(data.session.user.id, request, data.session.access_token);
  }

  // Set role cookie for middleware routing
  const userId = data.session?.user?.id;
  if (userId) {
    try {
      const profile = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1)
        .then((rows) => rows[0]);

      if (profile) {
        cookieStore.set('x-user-role', profile.role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    } catch {
      // Role cookie is advisory; don't fail auth if DB is unreachable
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
