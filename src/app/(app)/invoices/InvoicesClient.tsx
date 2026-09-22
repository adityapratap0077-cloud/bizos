'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  PageHeader,
  Select,
  type Column,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  deleteInvoice,
  getInvoicePdfData,
} from '@/actions/invoices';
import { generateInvoicePdf } from '@/lib/pdf';
import { formatMoney } from '@/lib/currency';
import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
} from '@/lib/types';
import InvoiceForm, { type EditingInvoice } from './InvoiceForm';

interface BusinessDefaults {
  tax_rate: number;
  tax_name: string;
  currency: string;
}

function badgeColor(status: InvoiceStatus): 'gray' | 'yellow' | 'green' {
  if (status === 'Paid') return 'green';
  if (status === 'Pending') return 'yellow';
  return 'gray';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoicesClient({
  invoices,
  customers,
  business,
}: {
  invoices: Invoice[];
  customers: { id: string; name: string }[];
  business: BusinessDefaults;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditingInvoice | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      if (!q) return true;
      return `${inv.invoice_number} ${inv.customer_name ?? ''}`.toLowerCase().includes(q);
    });
  }, [invoices, statusFilter, query]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  async function openEdit(id: string) {
    setEditLoadingId(id);
    try {
      const result = await getInvoicePdfData(id);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      setEditing({ invoice: result.invoice, items: result.items });
      setFormOpen(true);
    } finally {
      setEditLoadingId(null);
    }
  }

  async function handleDownloadPdf(inv: Invoice) {
    setPdfLoadingId(inv.id);
    try {
      const result = await getInvoicePdfData(inv.id);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      const doc = generateInvoicePdf({
        invoice: result.invoice,
        items: result.items,
        business: result.business,
        customer: result.customer,
      });
      doc.save(`invoice-${result.invoice.invoice_number}.pdf`);
      toast('PDF downloaded.', 'success');
    } finally {
      setPdfLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await deleteInvoice(pendingDelete.id);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      toast('Invoice deleted.', 'success');
      setPendingDelete(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Invoice>[] = [
    {
      header: 'Number',
      render: (inv) => (
        <Link
          href={`/invoices/${inv.id}`}
          className="font-mono text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {inv.invoice_number}
        </Link>
      ),
    },
    {
      header: 'Customer',
      render: (inv) => inv.customer_name ?? '—',
    },
    {
      header: 'Issue date',
      render: (inv) => formatDate(inv.issue_date),
    },
    {
      header: 'Due date',
      render: (inv) => formatDate(inv.due_date),
    },
    {
      header: 'Total',
      className: 'text-right',
      render: (inv) => (
        <span className="font-semibold text-gray-900">
          {formatMoney(inv.total, business.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (inv) => <Badge color={badgeColor(inv.status)}>{inv.status}</Badge>,
    },
    {
      header: 'Actions',
      render: (inv) => (
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href={`/invoices/${inv.id}`}
            className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            View
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(inv.id)}
            loading={editLoadingId === inv.id}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadPdf(inv)}
            loading={pdfLoadingId === inv.id}
          >
            PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!text-red-600 hover:!bg-red-50"
            onClick={() => setPendingDelete(inv)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Bill your customers and track what is paid."
        actions={
          <Button onClick={openNew} disabled={customers.length === 0}>
            New invoice
          </Button>
        }
      />

      {customers.length === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            You need at least one customer before you can create an invoice. Add
            one from the Customers page first.
          </p>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="Search by number or customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search invoices"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | InvoiceStatus)}
          options={[
            { value: 'All', label: 'All statuses' },
            ...INVOICE_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice and it will appear here."
          action={
            customers.length > 0 ? (
              <Button onClick={openNew}>Create your first invoice</Button>
            ) : undefined
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No invoices match your filters"
          description="Try a different search term or status filter."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(inv) => inv.id}
          ariaLabel="Invoices"
        />
      )}

      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customers={customers}
        business={business}
        editing={editing}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete invoice?"
        message={`Delete invoice ${pendingDelete?.invoice_number}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </>
  );
}
