'use server';

import { revalidatePath } from 'next/cache';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { validateBusinessSettings, validateProfile, type FieldErrors } from '@/lib/validations';
import type { ActionResult } from '@/lib/types';

export interface BusinessSettingsInput {
  name: string;
  logo_url: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  tax_name: string;
  tax_rate: number | string;
}

/** ActionResult plus optional per-field errors for form display. */
export type SettingsActionResult = ActionResult & { fieldErrors?: FieldErrors };

function firstError(errors: FieldErrors): string {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : 'Invalid input.';
}

function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t === '' ? null : t;
}

export async function updateBusinessSettings(
  input: BusinessSettingsInput,
): Promise<SettingsActionResult> {
  const { supabase, business } = await requireBusiness();

  const payload = {
    name: input.name.trim(),
    logo_url: emptyToNull(input.logo_url),
    email: emptyToNull(input.email),
    phone: emptyToNull(input.phone),
    address: emptyToNull(input.address),
    currency: input.currency,
    tax_name: input.tax_name.trim() === '' ? 'Tax' : input.tax_name.trim(),
    tax_rate: Number(input.tax_rate),
  };

  const errors = validateBusinessSettings(payload);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  const { error } = await supabase.from('businesses').update(payload).eq('id', business.id);
  if (error) {
    return { ok: false, error: 'Could not save your settings. Please try again.' };
  }

  await logActivity(supabase, business.id, 'Updated business settings', 'business', business.id);
  revalidatePath('/settings');
  return { ok: true };
}

export async function updateProfile(input: {
  full_name: string;
}): Promise<SettingsActionResult> {
  const { supabase, user, business } = await requireBusiness();

  const errors = validateProfile({ full_name: input.full_name });
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: input.full_name.trim() })
    .eq('id', user.id);
  if (error) {
    return { ok: false, error: 'Could not update your profile. Please try again.' };
  }

  await logActivity(supabase, business.id, 'Updated profile', 'profile', user.id);
  revalidatePath('/profile');
  return { ok: true };
}
