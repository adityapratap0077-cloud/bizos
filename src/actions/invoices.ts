'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { toMoney } from '@/lib/currency';
import { validateInvoice, type FieldErrors } from '@/lib/validations';
import {
  INVOICE_STATUSES,
  type ActionResult,
  type Business,
  type Customer,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from '@/lib/types';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceInput {
  customer_id: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  discount: number;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceItemInput[];
}

/** ActionResult plus optional per-field errors for form display. */
export type InvoiceActionResult = ActionResult & { fieldErrors?: FieldErrors };

export type InvoicePdfDataResult =
  | {
      ok: true;
      invoice: Invoice;
      items: InvoiceItem[];
      business: Business;
      customer: Customer | null;
    }
  | { ok: false; error: string };

function firstError(errors: FieldErrors): string {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : 'Invalid input.';
}

function trimOrNull(value: string): string | null {
  const t = value.trim();
  return t === '' ? null : t;
}

interface NormalizedInvoiceInput {
  customer_id: string;
  issue_date: string;
  due_date: string | null;
  tax_rate: number;
  discount: number;
  status: InvoiceStatus;
  notes: string | null;
  items: { description: string; quantity: number; unit_price: number }[];
}

function normalizeInput(input: InvoiceInput): NormalizedInvoiceInput {
  return {
    customer_id: input.customer_id,
    issue_date: input.issue_date,
    due_date: input.due_date.trim() === '' ? null : input.due_date,
    tax_rate: Number(input.tax_rate ?? 0),
    discount: Number(input.discount ?? 0),
    status: input.status,
    notes: trimOrNull(input.notes),
    items: (input.items ?? []).map((item) => ({
      description: String(item.description ?? '').trim(),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })),
  };
}

interface ComputedTotals {
  lineAmounts: number[];
  subtotal: number;
  tax_amount: number;
  discount: number;
  total: number;
}

/** Server-side money math. Single source of truth for invoice totals. */
function computeTotals(
  items: { quantity: number; unit_price: number }[],
  taxRate: number,
  discountRaw: number,
): ComputedTotals {
  const lineAmounts = items.map((item) => toMoney(item.quantity * item.unit_price));
  const subtotal = toMoney(lineAmounts.reduce((sum, amount) => sum + amount, 0));
  const tax_amount = toMoney((subtotal * taxRate) / 100);
  const discount = toMoney(discountRaw);
  const total = toMoney(Math.max(0, subtotal + tax_amount - discount));
  return { lineAmounts, subtotal, tax_amount, discount, total };
}

async function saveInvoiceItems(
  supabase: SupabaseClient,
  invoiceId: string,
  items: { description: string; quantity: number; unit_price: number }[],
  lineAmounts: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = items.map((item, i) => ({
    invoice_id: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: lineAmounts[i],
  }));
  const { error } = await supabase.from('invoice_items').insert(rows);
  if (error) {
    return { ok: false, error: 'Could not save invoice items. Please try again.' };
  }
  return { ok: true };
}

export async function createInvoice(input: InvoiceInput): Promise<InvoiceActionResult> {
  const { supabase, business } = await requireBusiness();
  const payload = normalizeInput(input);

  const errors = validateInvoice(payload as unknown as Record<string, unknown>);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name, address')
    .eq('business_id', business.id)
    .eq('id', payload.customer_id)
    .maybeSingle();
  if (customerError || !customer) {
    return {
      ok: false,
      error: 'Customer not found.',
      fieldErrors: { customer_id: 'Customer not found.' },
    };
  }

  const { lineAmounts, subtotal, tax_amount, discount, total } = computeTotals(
    payload.items,
    payload.tax_rate,
    payload.discount,
  );

  const { data: numberData, error: numberError } = await supabase.rpc('next_invoice_number', {
    p_business_id: business.id,
  });
  const invoiceNumber = numberData as string | null;
  if (numberError || !invoiceNumber) {
    return { ok: false, error: 'Could not generate an invoice number. Please try again.' };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      business_id: business.id,
      customer_id: payload.customer_id,
      invoice_number: invoiceNumber,
      business_name: business.name,
      business_address: business.address,
      customer_address: customer.address,
      subtotal,
      tax_rate: payload.tax_rate,
      tax_amount,
      discount,
      total,
      issue_date: payload.issue_date,
      due_date: payload.due_date,
      status: payload.status,
      notes: payload.notes,
    })
    .select('id')
    .single();

  if (invoiceError || !invoice) {
    return { ok: false, error: 'Could not create the invoice. Please try again.' };
  }

  const itemsResult = await saveInvoiceItems(supabase, invoice.id, payload.items, lineAmounts);
  if (!itemsResult.ok) {
    // Never leave a half-written invoice behind.
    await supabase.from('invoices').delete().eq('id', invoice.id);
    return { ok: false, error: itemsResult.error };
  }

  await logActivity(supabase, business.id, 'Created invoice', 'invoice', invoice.id, {
    invoice_number: invoiceNumber,
    total,
  });
  revalidatePath('/invoices');
  return { ok: true, id: invoice.id };
}

export async function updateInvoice(
  id: string,
  input: InvoiceInput,
): Promise<InvoiceActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('invoices')
    .select('id')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Invoice not found.' };
  }

  const payload = normalizeInput(input);
  const errors = validateInvoice(payload as unknown as Record<string, unknown>);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors), fieldErrors: errors };
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, name, address')
    .eq('business_id', business.id)
    .eq('id', payload.customer_id)
    .maybeSingle();
  if (customerError || !customer) {
    return {
      ok: false,
      error: 'Customer not found.',
      fieldErrors: { customer_id: 'Customer not found.' },
    };
  }

  const { lineAmounts, subtotal, tax_amount, discount, total } = computeTotals(
    payload.items,
    payload.tax_rate,
    payload.discount,
  );

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      customer_id: payload.customer_id,
      business_name: business.name,
      business_address: business.address,
      customer_address: customer.address,
      subtotal,
      tax_rate: payload.tax_rate,
      tax_amount,
      discount,
      total,
      issue_date: payload.issue_date,
      due_date: payload.due_date,
      status: payload.status,
      notes: payload.notes,
    })
    .eq('id', id);
  if (updateError) {
    return { ok: false, error: 'Could not update the invoice. Please try again.' };
  }

  // Replace all line items with the newly submitted set.
  const { error: deleteItemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', id);
  if (deleteItemsError) {
    return { ok: false, error: 'Could not update invoice items. Please try again.' };
  }

  const itemsResult = await saveInvoiceItems(supabase, id, payload.items, lineAmounts);
  if (!itemsResult.ok) {
    return { ok: false, error: itemsResult.error };
  }

  await logActivity(supabase, business.id, 'Updated invoice', 'invoice', id, { total });
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { ok: true, id };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data, error } = await supabase
    .from('invoices')
    .delete()
    .eq('business_id', business.id)
    .eq('id', id)
    .select('id');

  if (error) {
    return { ok: false, error: 'Could not delete the invoice. Please try again.' };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'Invoice not found.' };
  }

  await logActivity(supabase, business.id, 'Deleted invoice', 'invoice', id);
  revalidatePath('/invoices');
  return { ok: true };
}

export async function setInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  if (!INVOICE_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status.' };
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('business_id', business.id)
    .eq('id', id)
    .select('id');

  if (error) {
    return { ok: false, error: 'Could not update the invoice status. Please try again.' };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'Invoice not found.' };
  }

  await logActivity(supabase, business.id, `Marked invoice as ${status}`, 'invoice', id, {
    status,
  });
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { ok: true };
}

/**
 * Fetch everything the PDF builder needs, scoped to the user's business.
 * Called client-side before generateInvoicePdf().
 */
export async function getInvoicePdfData(id: string): Promise<InvoicePdfDataResult> {
  const { supabase, business } = await requireBusiness();

  const { data: invoiceRaw, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (invoiceError || !invoiceRaw) {
    return { ok: false, error: 'Invoice not found.' };
  }
  const invoice = invoiceRaw as Invoice;

  const { data: itemsRaw } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', id)
    .order('created_at', { ascending: true });

  const { data: customerRaw } = await supabase
    .from('customers')
    .select('*')
    .eq('id', invoice.customer_id)
    .maybeSingle();

  return {
    ok: true,
    invoice,
    items: (itemsRaw ?? []) as InvoiceItem[],
    business,
    customer: (customerRaw as Customer | null) ?? null,
  };
}
