import { requireBusiness } from '@/lib/business';
import type { Customer } from '@/lib/types';
import CustomersClient from './CustomersClient';

export const metadata = { title: 'Customers' };

export default async function CustomersPage() {
  const { supabase, business } = await requireBusiness();

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const customers = (data ?? []) as Customer[];

  return <CustomersClient customers={customers} />;
}
