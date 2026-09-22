import { requireBusiness } from '@/lib/business';
import type { Invoice } from '@/lib/types';
import InvoicesClient from './InvoicesClient';

export const metadata = { title: 'Invoices — BizOS' };

export default async function InvoicesPage() {
  const { supabase, business } = await requireBusiness();

  const { data: invoicesRaw } = await supabase
    .from('invoices')
    .select('*, customers(name)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const { data: customersRaw } = await supabase
    .from('customers')
    .select('id, name')
    .eq('business_id', business.id)
    .order('name', { ascending: true });

  const invoices: Invoice[] = (invoicesRaw ?? []).map((row) => {
    const joined = row.customers as { name?: string } | { name?: string }[] | null;
    const customerName = Array.isArray(joined) ? joined[0]?.name : joined?.name;
    return {
      id: row.id,
      business_id: row.business_id,
      customer_id: row.customer_id,
      invoice_number: row.invoice_number,
      business_name: row.business_name,
      business_address: row.business_address,
      customer_address: row.customer_address,
      subtotal: row.subtotal,
      tax_rate: row.tax_rate,
      tax_amount: row.tax_amount,
      discount: row.discount,
      total: row.total,
      issue_date: row.issue_date,
      due_date: row.due_date,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer_name: customerName ?? undefined,
    } as Invoice;
  });

  const customers = (customersRaw ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }));

  return (
    <InvoicesClient
      invoices={invoices}
      customers={customers}
      business={{
        tax_rate: Number(business.tax_rate ?? 0),
        tax_name: business.tax_name ?? 'Tax',
        currency: business.currency ?? 'INR',
      }}
    />
  );
}
