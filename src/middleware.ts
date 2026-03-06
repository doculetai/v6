import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_AUTH_ROUTES = ['/login', '/signup', '/reset-password', '/update-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Unauthenticated user trying to access dashboard → redirect to login
  if (!user && isDashboardRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on auth pages → redirect to dashboard
  if (user && isAuthRoute) {
    const role = request.cookies.get('x-user-role')?.value ?? 'student';
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = `/dashboard/${role}`;
    dashUrl.search = '';
    return NextResponse.redirect(dashUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
