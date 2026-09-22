import { notFound } from 'next/navigation';
import { requireBusiness } from '@/lib/business';
import type { ActivityLog, Booking, Customer, Invoice, Lead, Task } from '@/lib/types';
import CustomerDetailClient from './CustomerDetailClient';

export const metadata = { title: 'Customer details' };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, business } = await requireBusiness();
  const biz = business.id;

  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', biz)
    .eq('id', id)
    .maybeSingle();

  if (!customerData) notFound();
  const customer = customerData as Customer;

  const [leadRes, tasksRes, bookingsRes, invoicesRes, activityRes] = await Promise.all([
    customer.lead_id
      ? supabase.from('leads').select('*').eq('business_id', biz).eq('id', customer.lead_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('tasks')
      .select('*')
      .eq('business_id', biz)
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('*')
      .eq('business_id', biz)
      .eq('customer_id', id)
      .order('booking_date', { ascending: true }),
    supabase
      .from('invoices')
      .select('*')
      .eq('business_id', biz)
      .eq('customer_id', id)
      .order('issue_date', { ascending: false }),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('business_id', biz)
      .eq('entity_type', 'customer')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const lead = (leadRes.data ?? null) as Lead | null;
  const tasks = (tasksRes.data ?? []) as Task[];
  const bookings = ((bookingsRes.data ?? []) as Booking[]).map((b) => ({
    ...b,
    price: b.price == null ? null : Number(b.price),
  }));
  const invoices = ((invoicesRes.data ?? []) as Invoice[]).map((inv) => ({
    ...inv,
    total: Number(inv.total ?? 0),
  }));
  const activity = (activityRes.data ?? []) as ActivityLog[];

  return (
    <CustomerDetailClient
      customer={customer}
      lead={lead}
      tasks={tasks}
      bookings={bookings}
      invoices={invoices}
      activity={activity}
      businessCurrency={business.currency}
    />
  );
}
