'use server';

import { revalidatePath } from 'next/cache';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { validateCustomer } from '@/lib/validations';
import type { ActionResult } from '@/lib/types';

export type CustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
};

function cleanStr(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function firstError(errors: Record<string, string>): string {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : 'Invalid input.';
}

function normalize(input: CustomerInput) {
  return {
    name: String(input.name ?? '').trim(),
    email: cleanStr(input.email),
    phone: cleanStr(input.phone),
    company: cleanStr(input.company),
    address: cleanStr(input.address),
    notes: cleanStr(input.notes),
  };
}

export async function createCustomer(input: CustomerInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateCustomer(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const row = { business_id: business.id, ...normalize(input) };
  const { data, error } = await supabase.from('customers').insert(row).select('id').single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the customer.' };
  }

  await logActivity(supabase, business.id, `Added customer ${row.name}`, 'customer', data.id);
  revalidatePath('/customers');
  return { ok: true, id: data.id };
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateCustomer(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('customers')
    .select('id')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Customer not found.' };
  }

  const row = normalize(input);
  const { error } = await supabase
    .from('customers')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Updated customer ${row.name}`, 'customer', id);
  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return { ok: true, id };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('customers')
    .select('id, name')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Customer not found.' };
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Deleted customer ${existing.name}`, 'customer', id);
  revalidatePath('/customers');
  return { ok: true };
}
