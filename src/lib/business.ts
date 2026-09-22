import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Business } from '@/lib/types';

/**
 * Server-only helpers. Do NOT import this file from client components
 * (it uses next/headers via the server Supabase client).
 */

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

/**
 * Returns the signed-in user's business. The signup trigger
 * (supabase/migrations/001_initial.sql) creates one automatically;
 * this creates a fallback row if it is ever missing, so pages never crash.
 * The business_id is ALWAYS resolved server-side — client input is never trusted.
 */
export async function requireBusiness() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let business = data as Business | null;
  if (!business) {
    const { data: created, error } = await supabase
      .from('businesses')
      .insert({ owner_id: user.id, name: 'My Business', email: user.email })
      .select()
      .single();
    if (error || !created) {
      throw new Error('Could not set up your business. Please try again.');
    }
    business = created as Business;
  }

  return { supabase, user, business };
}
