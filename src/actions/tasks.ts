'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireBusiness } from '@/lib/business';
import { logActivity } from '@/lib/activity';
import { validateTask } from '@/lib/validations';
import type { ActionResult, TaskPriority, TaskStatus } from '@/lib/types';

export type TaskInput = {
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  customer_id?: string;
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

function normalize(input: TaskInput) {
  return {
    title: String(input.title ?? '').trim(),
    description: cleanStr(input.description),
    due_date: cleanStr(input.due_date),
    priority: ((cleanStr(input.priority) ?? 'Medium') as TaskPriority),
    status: ((cleanStr(input.status) ?? 'Todo') as TaskStatus),
    customer_id: cleanStr(input.customer_id),
  };
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

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateTask(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const row = normalize(input);
  if (row.customer_id && !(await customerBelongsToBusiness(supabase, business.id, row.customer_id))) {
    return { ok: false, error: 'Selected customer not found.' };
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ business_id: business.id, ...row })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not create the task.' };
  }

  await logActivity(supabase, business.id, `Added task ${row.title}`, 'task', data.id);
  revalidatePath('/tasks');
  return { ok: true, id: data.id };
}

export async function updateTask(id: string, input: TaskInput): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const errors = validateTask(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: firstError(errors) };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('id')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Task not found.' };
  }

  const row = normalize(input);
  if (row.customer_id && !(await customerBelongsToBusiness(supabase, business.id, row.customer_id))) {
    return { ok: false, error: 'Selected customer not found.' };
  }

  const { error } = await supabase
    .from('tasks')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Updated task ${row.title}`, 'task', id);
  revalidatePath('/tasks');
  return { ok: true, id };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Task not found.' };
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Deleted task ${existing.title}`, 'task', id);
  revalidatePath('/tasks');
  return { ok: true };
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<ActionResult> {
  const { supabase, business } = await requireBusiness();

  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { ok: false, error: 'Task not found.' };
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('business_id', business.id)
    .eq('id', id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await logActivity(supabase, business.id, `Updated task ${existing.title}`, 'task', id);
  revalidatePath('/tasks');
  return { ok: true, id };
}
