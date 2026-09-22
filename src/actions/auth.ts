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
