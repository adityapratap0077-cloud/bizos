'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  type Column,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import { deleteCustomer } from '@/actions/customers';
import { formatDate } from '@/lib/display';
import type { Customer } from '@/lib/types';
import CustomerForm from './CustomerForm';

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.company]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [customers, search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteCustomer(deleteTarget.id);
    setDeleting(false);
    if (res.ok) {
      toast('Customer deleted.', 'success');
      setDeleteTarget(null);
    } else {
      toast(res.error, 'error');
    }
  }

  const columns: Column<Customer>[] = [
    {
      header: 'Name',
      render: (c) => (
        <div>
          <p className="font-medium text-gray-900">{c.name}</p>
          {c.company && <p className="text-xs text-gray-500">{c.company}</p>}
        </div>
      ),
    },
    {
      header: 'Email',
      render: (c) => (c.email ? <span className="text-xs">{c.email}</span> : <span className="text-gray-400">—</span>),
    },
    {
      header: 'Phone',
      render: (c) => (c.phone ? <span className="text-xs">{c.phone}</span> : <span className="text-gray-400">—</span>),
    },
    {
      header: 'Company',
      render: (c) => c.company ?? <span className="text-gray-400">—</span>,
    },
    {
      header: 'Created',
      render: (c) => <span className="whitespace-nowrap text-xs">{formatDate(c.created_at)}</span>,
    },
    {
      header: 'Actions',
      className: 'whitespace-nowrap',
      render: (c) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => router.push(`/customers/${c.id}`)} aria-label={`View ${c.name}`}>
            View
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTarget(c)}
            aria-label={`Delete ${c.name}`}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Everyone you've won — contact details and history in one place."
        actions={<Button onClick={openAdd}>Add customer</Button>}
      />

      <div className="mb-4">
        <Input
          name="search"
          placeholder="Search name, email, phone or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search customers"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
          description={
            customers.length === 0
              ? 'Convert a lead or add a customer to get started.'
              : 'Try a different search term.'
          }
          action={customers.length === 0 ? <Button onClick={openAdd}>Add customer</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} ariaLabel="Customers" />
      )}

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer"
        message={`Delete ${deleteTarget?.name ?? 'this customer'}? This will also delete their bookings and invoices. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
