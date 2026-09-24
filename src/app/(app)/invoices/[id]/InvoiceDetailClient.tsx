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
import {
  deleteInvoice,
  getInvoicePdfData,
  setInvoiceStatus,
} from '@/actions/invoices';
import { generateInvoicePdf } from '@/lib/pdf';
import { formatMoney } from '@/lib/currency';
import type {
  Business,
  Customer,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
} from '@/lib/types';
import InvoiceForm from '../InvoiceForm';
import type { BadgeColor } from '@/lib/display';

function badgeColor(status: InvoiceStatus): BadgeColor {
  if (status === 'Paid') return 'pine';
  if (status === 'Pending') return 'gold';
  return 'ink';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoiceDetailClient({
  invoice,
  items,
  customer,
  customers,
  business,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  customer: Customer | null;
  customers: { id: string; name: string }[];
  business: Business;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState<InvoiceStatus | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const currency = business.currency || 'INR';
  const taxName = business.tax_name || 'Tax';

  async function handleSetStatus(status: InvoiceStatus) {
    setStatusLoading(status);
    try {
      const result = await setInvoiceStatus(invoice.id, status);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      toast(`Invoice marked as ${status.toLowerCase()}.`, 'success');
      router.refresh();
    } finally {
      setStatusLoading(null);
    }
  }

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const result = await getInvoicePdfData(invoice.id);
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
      setPdfLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      toast('Invoice deleted.', 'success');
      router.push('/invoices');
    } finally {
      setDeleting(false);
    }
  }

  const itemColumns: Column<InvoiceItem>[] = [
    { header: 'Description', render: (it) => it.description },
    {
      header: 'Qty',
      className: 'text-right',
      render: (it) => String(it.quantity),
    },
    {
      header: 'Unit price',
      className: 'text-right',
      render: (it) => formatMoney(it.unit_price, currency),
    },
    {
      header: 'Amount',
      className: 'text-right',
      render: (it) => (
        <span className="font-medium text-ink-900">{formatMoney(it.amount, currency)}</span>
      ),
    },
  ];

  const billToLines = [
    invoice.customer_address || customer?.address,
    customer?.email,
    customer?.phone,
  ].filter(Boolean) as string[];

  return (
    <>
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`Issued ${formatDate(invoice.issue_date)}`}
        actions={
          <>
            <Badge color={badgeColor(invoice.status)}>{invoice.status}</Badge>
            <Button variant="secondary" onClick={() => router.push('/invoices')}>
              Back to invoices
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Bill to
            </h2>
            <p className="font-semibold text-ink-900">
              {customer?.name ?? 'Unknown customer'}
            </p>
            {customer?.company && <p className="text-sm text-ink-600">{customer.company}</p>}
            {billToLines.map((line, i) => (
              <p key={i} className="text-sm text-ink-600">
                {line}
              </p>
            ))}
          </Card>

          <Card className="!p-0">
            <DataTable
              columns={itemColumns}
              rows={items}
              rowKey={(it) => it.id}
              ariaLabel="Invoice line items"
            />
          </Card>

          {invoice.notes && (
            <Card>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-500">
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm text-ink-700">{invoice.notes}</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Summary
            </h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="text-ink-900">{formatMoney(invoice.subtotal, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">
                  {taxName} ({invoice.tax_rate}%)
                </dt>
                <dd className="text-ink-900">{formatMoney(invoice.tax_amount, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Discount</dt>
                <dd className="text-ink-900">{formatMoney(invoice.discount, currency)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-ink-200 pt-2 text-base font-bold">
                <dt className="text-ink-900">Total</dt>
                <dd className="text-ink-900">{formatMoney(invoice.total, currency)}</dd>
              </div>
            </dl>
            <dl className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Issue date</dt>
                <dd className="text-ink-900">{formatDate(invoice.issue_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Due date</dt>
                <dd className="text-ink-900">{formatDate(invoice.due_date)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Actions
            </h2>
            <div className="flex flex-col gap-2">
              {invoice.status !== 'Paid' && (
                <Button
                  onClick={() => handleSetStatus('Paid')}
                  loading={statusLoading === 'Paid'}
                >
                  Mark as paid
                </Button>
              )}
              {invoice.status !== 'Pending' && (
                <Button
                  variant="secondary"
                  onClick={() => handleSetStatus('Pending')}
                  loading={statusLoading === 'Pending'}
                >
                  Mark as pending
                </Button>
              )}
              <Button variant="secondary" onClick={handleDownloadPdf} loading={pdfLoading}>
                Download PDF
              </Button>
              <Button variant="secondary" onClick={() => setFormOpen(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => setPendingDelete(true)}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <InvoiceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customers={customers}
        business={{
          tax_rate: Number(business.tax_rate ?? 0),
          tax_name: business.tax_name ?? 'Tax',
          currency: business.currency ?? 'INR',
        }}
        editing={{ invoice, items }}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={pendingDelete}
        title="Delete invoice?"
        message={`Delete invoice ${invoice.invoice_number}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(false)}
        loading={deleting}
      />
    </>
  );
}
