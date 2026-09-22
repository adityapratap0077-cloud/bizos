import { notFound } from 'next/navigation';
import { requireBusiness } from '@/lib/business';
import type { Customer, Invoice, InvoiceItem } from '@/lib/types';
import InvoiceDetailClient from './InvoiceDetailClient';

export const metadata = { title: 'Invoice details — BizOS' };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, business } = await requireBusiness();

  const { data: invoiceRaw } = await supabase
    .from('invoices')
    .select('*')
    .eq('business_id', business.id)
    .eq('id', id)
    .maybeSingle();
  if (!invoiceRaw) notFound();
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

  const { data: customersRaw } = await supabase
    .from('customers')
    .select('id, name')
    .eq('business_id', business.id)
    .order('name', { ascending: true });

  return (
    <InvoiceDetailClient
      invoice={invoice}
      items={(itemsRaw ?? []) as InvoiceItem[]}
      customer={(customerRaw as Customer | null) ?? null}
      customers={(customersRaw ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name),
      }))}
      business={business}
    />
  );
}
