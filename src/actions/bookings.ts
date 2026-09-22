'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { validateBooking, type FieldErrors } from '@/lib/validations';
import type { ActionResult, BookingStatus } from '@/lib/types';

export interface BookingInput {
  customer_id: string;
  service: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: string | number;
  status: BookingStatus;
  notes: string;
}

/** ActionResult plus optional per-field errors for form display. */
export type BookingActionResult = ActionResult & { fieldErrors?: FieldErrors };

function firstError(errors: FieldErrors): string {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : 'Invalid input.';
}

/** '' → null; numbers pass through; anything else that isn't numeric → null. */
function toPrice(value: string | number): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function trimOrNull(value: string): string | null {
  const t = value.trim();
  return t === '' ? null : t;
}

async function customerBelongsToBusiness(
  supabase: SupabaseClient,
  businessId: string,
  customerId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('customers')
    .select('id')
    .eq('business_id', businessId)
    .eq('id', customerId)
    .maybeSingle();
  return !error && !!data;
}

function normalizeInput(input: BookingInput) {
  return {
    customer_id: input.customer_id,
    service: input.service.trim(),
    booking_date: input.booking_date,
    start_time: input.start_time,
    end_time: input.end_time,
    price: toPrice(input.price),
    status: input.status,
    notes: trimOrNull(input.notes),
  };
}

export async function createBooking(input: BookingInput): Promise<BookingActionResult> {
  const { supabase, business } = await requireBusiness();
  const payload = normalizeInput(input);

  const errors = validateBooking(payload);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  if (!(await customerBelongsToBusiness(supabase, business.id, payload.customer_id))) {
    return {
      ok: false,
      error: 'Customer not found.',
      fieldErrors: { customer_id: 'Customer not found.' },
    };
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ business_id: business.id, ...payload })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: 'Could not create the booking. Please try again.' };
  }

  await logActivity(supabase, business.id, 'Created booking', 'booking', data.id, {
    service: payload.service,
    booking_date: payload.booking_date,
  });
  revalidatePath('/bookings');
  return { ok: true, id: data.id };
}

export async function updateBooking(
  id: string,
  input: BookingInput,
): Promise<BookingActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('bookings')
    .select('id')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Booking not found.' };
  }

  const payload = normalizeInput(input);
  const errors = validateBooking(payload);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  if (!(await customerBelongsToBusiness(supabase, business.id, payload.customer_id))) {
    return {
      ok: false,
      error: 'Customer not found.',
      fieldErrors: { customer_id: 'Customer not found.' },
    };
  }

  const { error } = await supabase.from('bookings').update(payload).eq('id', id);
  if (error) {
    return { ok: false, error: 'Could not update the booking. Please try again.' };
  }

  await logActivity(supabase, business.id, 'Updated booking', 'booking', id, {
    service: payload.service,
    booking_date: payload.booking_date,
  });
  revalidatePath('/bookings');
  return { ok: true, id };
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('business_id', business.id)
    .eq('id', id)
    .select('id');

  if (error) {
    return { ok: false, error: 'Could not delete the booking. Please try again.' };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'Booking not found.' };
  }

  await logActivity(supabase, business.id, 'Deleted booking', 'booking', id);
  revalidatePath('/bookings');
  return { ok: true };
}
