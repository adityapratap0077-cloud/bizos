'use server';

import { revalidatePath } from 'next/cache';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { validateLead } from '@/lib/validations';
import type { ActionResult, LeadStatus } from '@/lib/types';

export type LeadInput = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  service_interested?: string;
  estimated_value?: string | number;
  status?: string;
  follow_up_date?: string;
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

function normalize(input: LeadInput) {
  const status = cleanStr(input.status);
  return {
    name: String(input.name ?? '').trim(),
    email: cleanStr(input.email),
    phone: cleanStr(input.phone),
    company: cleanStr(input.company),
    source: cleanStr(input.source),
    service_interested: cleanStr(input.service_interested),
    estimated_value:
      input.estimated_value === '' || input.estimated_value === undefined
        ? null
        : Number(input.estimated_value),
    status: (status ?? 'New') as LeadStatus,
    follow_up_date: cleanStr(input.follow_up_date),
    notes: cleanStr(input.notes),
  };
}

export async function createLead(input: LeadInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateLead(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const row = { business_id: business.id, ...normalize(input) };
  const { data, error } = await supabase.from('leads').insert(row).select('id').single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the lead.' };
  }

  await logActivity(supabase, business.id, `Added lead ${row.name}`, 'lead', data.id);
  revalidatePath('/leads');
  return { ok: true, id: data.id };
}

export async function updateLead(id: string, input: LeadInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateLead(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('leads')
    .select('id')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Lead not found.' };
  }

  const row = normalize(input);
  const { error } = await supabase
    .from('leads')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Updated lead ${row.name}`, 'lead', id);
  revalidatePath('/leads');
  return { ok: true, id };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('leads')
    .select('id, name')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Lead not found.' };
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Deleted lead ${existing.name}`, 'lead', id);
  revalidatePath('/leads');
  return { ok: true };
}

export async function convertLeadToCustomer(leadId: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .eq('id', leadId)
    .maybeSingle();
  if (fetchError || !lead) {
    return { ok: false, error: 'Lead not found.' };
  }

  const { data: customer, error: insertError } = await supabase
    .from('customers')
    .insert({
      business_id: business.id,
      lead_id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
    })
    .select('id')
    .single();
  if (insertError || !customer) {
    return { ok: false, error: insertError?.message ?? 'Could not create the customer.' };
  }

  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: 'Won', updated_at: new Date().toISOString() })
    .eq('business_id', business.id)
    .eq('id', lead.id);
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await logActivity(
    supabase,
    business.id,
    `Converted lead ${lead.name} to customer`,
    'lead',
    lead.id,
  );
  await logActivity(supabase, business.id, `Added customer ${lead.name}`, 'customer', customer.id);

  revalidatePath('/leads');
  revalidatePath('/customers');
  return { ok: true, id: customer.id };
}
