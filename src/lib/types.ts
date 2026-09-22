/**
 * Shared TypeScript types mirroring the Supabase schema
 * (supabase/migrations/001_initial.sql).
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  tax_name: string;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Won',
  'Lost',
];

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  service_interested: string | null;
  estimated_value: number | null;
  status: LeadStatus;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  lead_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'Todo' | 'In progress' | 'Completed';
export const TASK_STATUSES: TaskStatus[] = ['Todo', 'In progress', 'Completed'];

export type TaskPriority = 'Low' | 'Medium' | 'High';
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export interface Task {
  id: string;
  business_id: string;
  customer_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'Scheduled' | 'Completed' | 'Cancelled';
export const BOOKING_STATUSES: BookingStatus[] = ['Scheduled', 'Completed', 'Cancelled'];

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  service: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Joined customer name (present when selected with a join). */
  customer_name?: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid';
export const INVOICE_STATUSES: InvoiceStatus[] = ['Draft', 'Pending', 'Paid'];

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  business_name: string | null;
  business_address: string | null;
  customer_address: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Joined customer name (present when selected with a join). */
  customer_name?: string;
}

export interface ActivityLog {
  id: string;
  business_id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Result shape returned by every server action. */
export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };
