'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { validateCredentials, type FieldErrors } from '@/lib/validations';

type AuthResult = { ok: boolean; error?: string; needsConfirmation?: boolean };

function firstError(errors: FieldErrors): string {
  return (
    errors.email ?? errors.password ?? 'Please check the form and try again.'
  );
}

export async function signUpAction(input: {
  email: string;
  password: string;
  fullName?: string;
  businessName?: string;
}): Promise<AuthResult> {
  const email = (input.email ?? '').trim();
  const errors = validateCredentials({ email, password: input.password });
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName?.trim() || null,
        business_name: input.businessName?.trim() || null,
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  if (data.user && !data.session) {
    // Email confirmation is enabled — user must click the link before signing in.
    return { ok: true, needsConfirmation: true };
  }
  redirect('/dashboard');
}

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = (input.email ?? '').trim();
  const errors = validateCredentials({ email, password: input.password });
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

const PRODUCTION_URL = 'https://bizos-sca3jyoi1-adityapratap0077-cloud.vercel.app';

/**
 * Starts Google OAuth. Redirects the browser to Google's consent screen.
 * On return, /auth/callback exchanges the code for a session.
 * New OAuth users get a profile + default business from the
 * public.handle_new_user() database trigger — same as email signups.
 */
export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const redirectTo =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/callback'
      : `${PRODUCTION_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error || !data?.url) {
    // Most common cause: the Google provider isn't enabled in Supabase yet.
    const message =
      error?.message ??
      'Could not start Google sign-in. Please try again or use email sign-in.';
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  redirect(data.url);
}
