'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  createInvoice,
  updateInvoice,
  type InvoiceInput,
} from '@/actions/invoices';
import { validateInvoice, type FieldErrors } from '@/lib/validations';
import { formatMoney, toMoney } from '@/lib/currency';
import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from '@/lib/types';

export interface InvoiceFormLine {
  description: string;
  quantity: string;
  unit_price: string;
}

export interface EditingInvoice {
  invoice: Invoice;
  items: InvoiceItem[];
}

interface BusinessDefaults {
  tax_rate: number;
  tax_name: string;
  currency: string;
}

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  customers: { id: string; name: string }[];
  business: BusinessDefaults;
  editing?: EditingInvoice | null;
  onSaved?: () => void;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const emptyLine = (): InvoiceFormLine => ({ description: '', quantity: '1', unit_price: '' });

/**
 * Shared invoice create/edit form. Used by the invoices list page
 * and the invoice detail page.
 */
export default function InvoiceForm({
  open,
  onClose,
  customers,
  business,
  editing,
  onSaved,
}: InvoiceFormProps) {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('Draft');
  const [taxRate, setTaxRate] = useState(String(business.tax_rate ?? 0));
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceFormLine[]>([emptyLine()]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setCustomerId(editing.invoice.customer_id);
      setIssueDate(editing.invoice.issue_date);
      setDueDate(editing.invoice.due_date ?? '');
      setStatus(editing.invoice.status);
      setTaxRate(String(editing.invoice.tax_rate ?? 0));
      setDiscount(String(editing.invoice.discount ?? 0));
      setNotes(editing.invoice.notes ?? '');
      setLines(
        editing.items.length > 0
          ? editing.items.map((it) => ({
              description: it.description,
              quantity: String(it.quantity),
              unit_price: String(it.unit_price),
            }))
          : [emptyLine()],
      );
    } else {
      setCustomerId('');
      setIssueDate(todayIso());
      setDueDate('');
      setStatus('Draft');
      setTaxRate(String(business.tax_rate ?? 0));
      setDiscount('0');
      setNotes('');
      setLines([emptyLine()]);
    }
  }, [open, editing, business.tax_rate]);

  const totals = useMemo(() => {
    const lineAmounts = lines.map((line) =>
      toMoney(Number(line.quantity || 0) * Number(line.unit_price || 0)),
    );
    const subtotal = toMoney(lineAmounts.reduce((sum, a) => sum + a, 0));
    const taxAmount = toMoney((subtotal * Number(taxRate || 0)) / 100);
    const discountValue = toMoney(Number(discount || 0));
    const total = toMoney(Math.max(0, subtotal + taxAmount - discountValue));
    return { lineAmounts, subtotal, taxAmount, discountValue, total };
  }, [lines, taxRate, discount]);

  function updateLine(index: number, patch: Partial<InvoiceFormLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: InvoiceInput = {
      customer_id: customerId,
      issue_date: issueDate,
      due_date: dueDate,
      tax_rate: Number(taxRate || 0),
      discount: Number(discount || 0),
      status,
      notes,
      items: lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
      })),
    };

    const clientErrors = validateInvoice({
      ...input,
      items: input.items,
    });
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      const result = editing
        ? await updateInvoice(editing.invoice.id, input)
        : await createInvoice(input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast(result.error, 'error');
        return;
      }
      toast(editing ? 'Invoice updated.' : 'Invoice created.', 'success');
      onClose();
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit invoice ${editing.invoice.invoice_number}` : 'New invoice'}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="invoice-form" loading={saving}>
            {editing ? 'Save changes' : 'Create invoice'}
          </Button>
        </>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Customer *"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            error={errors.customer_id}
            placeholder="Choose a customer"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            error={errors.status}
            options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Issue date *"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            error={errors.issue_date}
          />
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.due_date}
            hint="Optional"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Line items *</span>
            <Button type="button" variant="secondary" size="sm" onClick={addLine}>
              Add row
            </Button>
          </div>
          {errors.items && (
            <p role="alert" className="mb-2 text-xs text-red-600">
              {errors.items}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {lines.map((line, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <Input
                  aria-label={`Item ${i + 1} description`}
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                  error={errors[`items.${i}.description`]}
                />
                <div className="mt-2 grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2">
                  <Input
                    aria-label={`Item ${i + 1} quantity`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: e.target.value })}
                    error={errors[`items.${i}.quantity`]}
                  />
                  <Input
                    aria-label={`Item ${i + 1} unit price`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                    value={line.unit_price}
                    onChange={(e) => updateLine(i, { unit_price: e.target.value })}
                    error={errors[`items.${i}.unit_price`]}
                  />
                  <div className="whitespace-nowrap pb-2 text-sm font-medium text-gray-700">
                    {formatMoney(totals.lineAmounts[i] ?? 0, business.currency)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(i)}
                    disabled={lines.length <= 1}
                    aria-label={`Remove item ${i + 1}`}
                    className="!text-red-600 hover:!bg-red-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={`${business.tax_name || 'Tax'} rate (%)`}
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            error={errors.tax_rate}
          />
          <Input
            label="Discount"
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            error={errors.discount}
          />
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(totals.subtotal, business.currency)}</span>
          </div>
          <div className="mt-1 flex justify-between text-gray-600">
            <span>
              {business.tax_name || 'Tax'} ({Number(taxRate || 0)}%)
            </span>
            <span>{formatMoney(totals.taxAmount, business.currency)}</span>
          </div>
          <div className="mt-1 flex justify-between text-gray-600">
            <span>Discount</span>
            <span>−{formatMoney(totals.discountValue, business.currency)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatMoney(totals.total, business.currency)}</span>
          </div>
        </div>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Payment terms, thank-you note, etc."
        />
      </form>
    </Modal>
  );
}
