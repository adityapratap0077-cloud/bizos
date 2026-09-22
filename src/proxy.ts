import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js 16 route guard (the `proxy.ts` convention replaces `middleware.ts`).
 * - Redirects unauthenticated visitors away from protected app routes.
 * - Redirects signed-in users away from /login and /signup.
 * - Refreshes the Supabase session on every matched request.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const protectedPrefixes = [
    '/dashboard',
    '/leads',
    '/customers',
    '/tasks',
    '/bookings',
    '/invoices',
    '/settings',
    '/profile',
  ];
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/customers/:path*',
    '/tasks/:path*',
    '/bookings/:path*',
    '/invoices/:path*',
    '/settings',
    '/profile',
    '/login',
    '/signup',
  ],
};
