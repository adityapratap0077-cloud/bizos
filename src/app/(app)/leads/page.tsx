import { requireBusiness } from '@/lib/business';
import type { Lead } from '@/lib/types';
import LeadsClient from './LeadsClient';

export const metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const { supabase, business } = await requireBusiness();

  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const leads = ((data ?? []) as Lead[]).map((lead) => ({
    ...lead,
    estimated_value: lead.estimated_value == null ? null : Number(lead.estimated_value),
  }));

  return <LeadsClient leads={leads} currency={business.currency} />;
}
