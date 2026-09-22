import { requireBusiness } from '@/lib/business';
import type { Task } from '@/lib/types';
import TasksClient, { type TaskWithCustomer } from './TasksClient';

export const metadata = { title: 'Tasks' };

export default async function TasksPage() {
  const { supabase, business } = await requireBusiness();

  const [{ data: tasksData }, { data: customersData }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, customers(name)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('customers')
      .select('id, name')
      .eq('business_id', business.id)
      .order('name', { ascending: true }),
  ]);

  const tasks: TaskWithCustomer[] = ((tasksData ?? []) as (Task & {
    customers: { name: string } | null;
  })[]).map((t) => {
    const { customers: joined, ...rest } = t;
    return { ...rest, customer_name: joined?.name ?? undefined };
  });

  const customers = ((customersData ?? []) as { id: string; name: string }[]).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return <TasksClient tasks={tasks} customers={customers} />;
}
