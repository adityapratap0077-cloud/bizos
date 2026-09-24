import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback — Google redirects here after consent.
 * Exchanges the one-time code for a session, then:
 *   success → /dashboard
 *   failure → /login with a readable ?error= message
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    const message =
      error.message || 'Google sign-in failed. Please try again.';
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`,
    );
  }

  const denied =
    searchParams.get('error_description') ||
    'Google sign-in was cancelled. If this keeps failing, the Google provider may not be enabled yet — use email sign-in for now.';
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(denied)}`,
  );
}
