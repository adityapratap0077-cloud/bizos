import { requireBusiness } from '@/lib/business';
import { formatMoney } from '@/lib/currency';
import { formatDate, LEAD_BADGE_COLORS, timeAgo } from '@/lib/display';
import { LEAD_STATUSES, type ActivityLog, type LeadStatus } from '@/lib/types';
import { Badge, Card, EmptyState, PageHeader, StatCard } from '@/components/ui';

export const metadata = { title: 'Dashboard' };

const STATUS_BAR_COLORS: Record<LeadStatus, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-yellow-400',
  Qualified: 'bg-purple-500',
  Proposal: 'bg-indigo-500',
  Won: 'bg-green-500',
  Lost: 'bg-red-500',
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function lastSixMonths(): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: MONTH_NAMES[d.getMonth()] });
  }
  return months;
}

export default async function DashboardPage() {
  const { supabase, business } = await requireBusiness();
  const today = new Date().toISOString().slice(0, 10);
  const biz = business.id;

  const [
    leadsCountRes,
    customersCountRes,
    bookingsCountRes,
    pendingInvoicesRes,
    allInvoiceTotalsRes,
    tasksDueTodayRes,
    activityRes,
    leadsByStatusRes,
    invoiceMonthsRes,
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', biz),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', biz)
      .eq('status', 'active'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', biz)
      .eq('status', 'Scheduled')
      .gte('booking_date', today),
    supabase.from('invoices').select('total').eq('business_id', biz).eq('status', 'Pending'),
    supabase
      .from('invoices')
      .select('total')
      .eq('business_id', biz)
      .in('status', ['Pending', 'Paid']),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', biz)
      .eq('due_date', today)
      .neq('status', 'Completed'),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('business_id', biz)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('leads').select('status').eq('business_id', biz),
    supabase.from('invoices').select('total, status, issue_date').eq('business_id', biz),
  ]);

  const totalLeads = leadsCountRes.count ?? 0;
  const activeCustomers = customersCountRes.count ?? 0;
  const upcomingBookings = bookingsCountRes.count ?? 0;
  const tasksDueToday = tasksDueTodayRes.count ?? 0;

  const pendingInvoices = (pendingInvoicesRes.data ?? []) as { total: number | string | null }[];
  const pendingInvoiceSum = pendingInvoices.reduce((s, r) => s + Number(r.total ?? 0), 0);

  const invoiceTotals = (allInvoiceTotalsRes.data ?? []) as { total: number | string | null }[];
  const totalInvoiceValue = invoiceTotals.reduce((s, r) => s + Number(r.total ?? 0), 0);

  const activity = (activityRes.data ?? []) as ActivityLog[];

  // Leads grouped by status (JS-side group).
  const statusCounts = new Map<LeadStatus, number>(
    LEAD_STATUSES.map((s) => [s, 0]),
  );
  for (const row of (leadsByStatusRes.data ?? []) as { status: string }[]) {
    if (LEAD_STATUSES.includes(row.status as LeadStatus)) {
      const key = row.status as LeadStatus;
      statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
    }
  }
  const maxStatusCount = Math.max(1, ...statusCounts.values());

  // Invoices by month, last 6 months (JS-side group), split paid vs pending.
  const months = lastSixMonths();
  const monthBuckets = new Map(months.map((m) => [m.key, { paid: 0, pending: 0 }]));
  for (const row of (invoiceMonthsRes.data ?? []) as {
    total: number | string | null;
    status: string;
    issue_date: string;
  }[]) {
    if (row.status !== 'Paid' && row.status !== 'Pending') continue;
    const key = String(row.issue_date ?? '').slice(0, 7);
    const bucket = monthBuckets.get(key);
    if (!bucket) continue;
    const amount = Number(row.total ?? 0);
    if (row.status === 'Paid') bucket.paid += amount;
    else bucket.pending += amount;
  }
  const monthData = months.map((m) => ({ ...m, ...monthBuckets.get(m.key)! }));
  const maxMonthValue = Math.max(
    1,
    ...monthData.flatMap((m) => [m.paid, m.pending]),
  );
  const hasInvoiceData = monthData.some((m) => m.paid > 0 || m.pending > 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A snapshot of your business today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total leads" value={String(totalLeads)} href="/leads" />
        <StatCard label="Active customers" value={String(activeCustomers)} href="/customers" />
        <StatCard label="Upcoming bookings" value={String(upcomingBookings)} href="/bookings" />
        <StatCard
          label="Pending invoices"
          value={String(pendingInvoices.length)}
          sub={formatMoney(pendingInvoiceSum, business.currency)}
          href="/invoices"
        />
        <StatCard
          label="Total invoice value"
          value={formatMoney(totalInvoiceValue, business.currency)}
          sub="Pending + paid"
        />
        <StatCard label="Tasks due today" value={String(tasksDueToday)} href="/tasks" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Leads by status — horizontal bars */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-gray-900">Leads by status</h2>
          {totalLeads === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No lead data yet. Add your first lead to see the breakdown.
            </p>
          ) : (
            <div className="space-y-3">
              {LEAD_STATUSES.map((status) => {
                const count = statusCounts.get(status) ?? 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <Badge color={LEAD_BADGE_COLORS[status]}>{status}</Badge>
                    </div>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR_COLORS[status]}`}
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-medium text-gray-700">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Invoices last 6 months — vertical bars, paid vs pending */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Invoices — last 6 months</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" /> Paid
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" /> Pending
              </span>
            </div>
          </div>
          {!hasInvoiceData ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No invoice data in the last 6 months.
            </p>
          ) : (
            <div>
              <div className="flex h-44 items-end justify-around gap-2">
                {monthData.map((m) => (
                  <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end">
                    <div className="flex h-full w-full items-end justify-center gap-1.5">
                      <div
                        className="w-5 rounded-t bg-green-500"
                        style={{ height: `${(m.paid / maxMonthValue) * 100}%` }}
                        title={`Paid: ${formatMoney(m.paid, business.currency)}`}
                        role="img"
                        aria-label={`${m.label} paid ${formatMoney(m.paid, business.currency)}`}
                      />
                      <div
                        className="w-5 rounded-t bg-amber-400"
                        style={{ height: `${(m.pending / maxMonthValue) * 100}%` }}
                        title={`Pending: ${formatMoney(m.pending, business.currency)}`}
                        role="img"
                        aria-label={`${m.label} pending ${formatMoney(m.pending, business.currency)}`}
                      />
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-500">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Recent activity</h2>
        {activity.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Actions you take across leads, customers, tasks, bookings and invoices will show up here."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-2.5">
                <p className="text-sm text-gray-700">{a.action}</p>
                <span
                  className="shrink-0 text-xs text-gray-400"
                  title={formatDate(a.created_at)}
                >
                  {timeAgo(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
