'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  PageHeader,
  type Column,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import { deleteCustomer } from '@/actions/customers';
import { formatMoney } from '@/lib/currency';
import {
  BOOKING_BADGE_COLORS,
  INVOICE_BADGE_COLORS,
  LEAD_BADGE_COLORS,
  PRIORITY_BADGE_COLORS,
  TASK_BADGE_COLORS,
  formatDate,
  timeAgo,
} from '@/lib/display';
import type {
  ActivityLog,
  Booking,
  Customer,
  Invoice,
  Lead,
  Task,
} from '@/lib/types';
import CustomerForm from '../CustomerForm';

export default function CustomerDetailClient({
  customer,
  lead,
  tasks,
  bookings,
  invoices,
  activity,
  businessCurrency,
}: {
  customer: Customer;
  lead: Lead | null;
  tasks: Task[];
  bookings: Booking[];
  invoices: Invoice[];
  activity: ActivityLog[];
  businessCurrency: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteCustomer(customer.id);
    setDeleting(false);
    if (res.ok) {
      toast('Customer deleted.', 'success');
      router.push('/customers');
    } else {
      toast(res.error, 'error');
      setDeleteOpen(false);
    }
  }

  const taskColumns: Column<Task>[] = [
    { header: 'Title', render: (t) => <span className="font-medium text-ink-900">{t.title}</span> },
    { header: 'Due', render: (t) => <span className="whitespace-nowrap text-xs">{formatDate(t.due_date)}</span> },
    {
      header: 'Priority',
      render: (t) => <Badge color={PRIORITY_BADGE_COLORS[t.priority]}>{t.priority}</Badge>,
    },
    {
      header: 'Status',
      render: (t) => <Badge color={TASK_BADGE_COLORS[t.status]}>{t.status}</Badge>,
    },
  ];

  const bookingColumns: Column<Booking>[] = [
    { header: 'Service', render: (b) => <span className="font-medium text-ink-900">{b.service}</span> },
    { header: 'Date', render: (b) => <span className="whitespace-nowrap text-xs">{formatDate(b.booking_date)}</span> },
    {
      header: 'Time',
      render: (b) => (
        <span className="whitespace-nowrap text-xs">
          {String(b.start_time).slice(0, 5)} – {String(b.end_time).slice(0, 5)}
        </span>
      ),
    },
    {
      header: 'Price',
      render: (b) =>
        b.price != null ? formatMoney(b.price, businessCurrency) : <span className="text-ink-400">—</span>,
    },
    {
      header: 'Status',
      render: (b) => <Badge color={BOOKING_BADGE_COLORS[b.status]}>{b.status}</Badge>,
    },
  ];

  const invoiceColumns: Column<Invoice>[] = [
    { header: 'Number', render: (inv) => <span className="font-medium text-ink-900">{inv.invoice_number}</span> },
    { header: 'Issued', render: (inv) => <span className="whitespace-nowrap text-xs">{formatDate(inv.issue_date)}</span> },
    {
      header: 'Total',
      render: (inv) => <span className="font-medium">{formatMoney(inv.total, businessCurrency)}</span>,
    },
    {
      header: 'Status',
      render: (inv) => <Badge color={INVOICE_BADGE_COLORS[inv.status]}>{inv.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.company ?? 'Customer'}
        actions={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      {/* Profile header */}
      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Email</p>
            <p className="mt-1 text-sm text-ink-900">{customer.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Phone</p>
            <p className="mt-1 text-sm text-ink-900">{customer.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Company</p>
            <p className="mt-1 text-sm text-ink-900">{customer.company ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Address</p>
            <p className="mt-1 text-sm text-ink-900">{customer.address ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Status</p>
            <p className="mt-1">
              <Badge color={customer.status === 'active' ? 'pine' : 'ink'}>{customer.status}</Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Customer since</p>
            <p className="mt-1 text-sm text-ink-900">{formatDate(customer.created_at)}</p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-4 border-t border-ink-100 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{customer.notes}</p>
          </div>
        )}
      </Card>

      {/* Related lead */}
      <Card className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Related lead</h2>
        {lead ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="font-medium text-ink-900">{lead.name}</span>
            <Badge color={LEAD_BADGE_COLORS[lead.status]}>{lead.status}</Badge>
            {lead.service_interested && <span className="text-ink-600">{lead.service_interested}</span>}
            {lead.estimated_value != null && (
              <span className="font-medium text-ink-900">
                {formatMoney(lead.estimated_value, businessCurrency)}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-400">—</p>
        )}
      </Card>

      {/* Tasks */}
      <Card className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-400">No tasks for this customer yet.</p>
        ) : (
          <DataTable columns={taskColumns} rows={tasks} rowKey={(r) => r.id} ariaLabel="Customer tasks" />
        )}
      </Card>

      {/* Bookings */}
      <Card className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-ink-400">No bookings for this customer yet.</p>
        ) : (
          <DataTable columns={bookingColumns} rows={bookings} rowKey={(r) => r.id} ariaLabel="Customer bookings" />
        )}
      </Card>

      {/* Invoices */}
      <Card className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink-900">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-ink-400">No invoices for this customer yet.</p>
        ) : (
          <DataTable columns={invoiceColumns} rows={invoices} rowKey={(r) => r.id} ariaLabel="Customer invoices" />
        )}
      </Card>

      {/* Activity */}
      <Card>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Activity history</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-ink-400">No recorded activity for this customer yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-2.5">
                <p className="text-sm text-ink-700">{a.action}</p>
                <span className="shrink-0 text-xs text-ink-400" title={formatDate(a.created_at)}>
                  {timeAgo(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} initial={customer} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete customer"
        message={`Delete ${customer.name}? This will also delete their bookings and invoices. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
