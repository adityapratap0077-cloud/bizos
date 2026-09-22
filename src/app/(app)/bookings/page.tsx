import { requireBusiness } from '@/lib/business';
import type { Booking } from '@/lib/types';
import BookingsClient from './BookingsClient';

export const metadata = { title: 'Bookings — BizOS' };

interface CustomerOption {
  id: string;
  name: string;
}

export default async function BookingsPage() {
  const { supabase, business } = await requireBusiness();

  const { data: bookingsRaw } = await supabase
    .from('bookings')
    .select('*, customers(name)')
    .eq('business_id', business.id)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  const { data: customersRaw } = await supabase
    .from('customers')
    .select('id, name')
    .eq('business_id', business.id)
    .order('name', { ascending: true });

  const bookings: Booking[] = (bookingsRaw ?? []).map((row) => {
    const joined = row.customers as { name?: string } | { name?: string }[] | null;
    const customerName = Array.isArray(joined) ? joined[0]?.name : joined?.name;
    return {
      id: row.id,
      business_id: row.business_id,
      customer_id: row.customer_id,
      service: row.service,
      booking_date: row.booking_date,
      start_time: row.start_time,
      end_time: row.end_time,
      price: row.price,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer_name: customerName ?? undefined,
    } as Booking;
  });

  const customers: CustomerOption[] = (customersRaw ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));

  return (
    <BookingsClient
      bookings={bookings}
      customers={customers}
      currency={business.currency}
    />
  );
}
