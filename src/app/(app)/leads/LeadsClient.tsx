'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  type Column,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  convertLeadToCustomer,
  createLead,
  deleteLead,
  updateLead,
  type LeadInput,
} from '@/actions/leads';
import { validateLead, type FieldErrors } from '@/lib/validations';
import { formatMoney } from '@/lib/currency';
import { LEAD_BADGE_COLORS, formatDate } from '@/lib/display';
import { LEAD_STATUSES, type Lead } from '@/lib/types';

/* ── LeadForm (add + edit) ──────────────────────────────────────────────── */

const EMPTY_FORM: Required<LeadInput> = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: '',
  service_interested: '',
  estimated_value: '',
  status: 'New',
  follow_up_date: '',
  notes: '',
};

function LeadForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: Lead | null;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Required<LeadInput>>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever the modal opens (add) or switches to a lead (edit).
  const formKey = open ? (initial?.id ?? 'new') : 'closed';
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setLastKey(formKey);
    setErrors({});
    setValues(
      initial
        ? {
            name: initial.name ?? '',
            email: initial.email ?? '',
            phone: initial.phone ?? '',
            company: initial.company ?? '',
            source: initial.source ?? '',
            service_interested: initial.service_interested ?? '',
            estimated_value:
              initial.estimated_value == null ? '' : String(initial.estimated_value),
            status: initial.status ?? 'New',
            follow_up_date: initial.follow_up_date ?? '',
            notes: initial.notes ?? '',
          }
        : EMPTY_FORM,
    );
  }

  const set = (field: keyof Required<LeadInput>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateLead(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    const res = initial ? await updateLead(initial.id, values) : await createLead(values);
    setSubmitting(false);

    if (res.ok) {
      toast(initial ? 'Lead updated.' : 'Lead added.', 'success');
      onClose();
    } else {
      toast(res.error, 'error');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit lead' : 'Add lead'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {initial ? 'Save changes' : 'Add lead'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Name *" name="name" value={values.name} onChange={set('name')} error={errors.name} autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" name="email" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="off" />
          <Input label="Phone" name="phone" value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="off" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company" name="company" value={values.company} onChange={set('company')} error={errors.company} autoComplete="off" />
          <Input
            label="Source"
            name="source"
            placeholder="e.g. Instagram, Referral"
            value={values.source}
            onChange={set('source')}
            error={errors.source}
            autoComplete="off"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Service interested"
            name="service_interested"
            value={values.service_interested}
            onChange={set('service_interested')}
            error={errors.service_interested}
            autoComplete="off"
          />
          <Input
            label="Estimated value"
            name="estimated_value"
            type="number"
            min="0"
            step="0.01"
            value={values.estimated_value}
            onChange={set('estimated_value')}
            error={errors.estimated_value}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={set('status')}
            error={errors.status}
            options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
          />
          <Input
            label="Follow-up date"
            name="follow_up_date"
            type="date"
            value={values.follow_up_date}
            onChange={set('follow_up_date')}
            error={errors.follow_up_date}
          />
        </div>
        <Textarea
          label="Notes"
          name="notes"
          rows={3}
          value={values.notes}
          onChange={set('notes')}
          error={errors.notes}
        />
      </form>
    </Modal>
  );
}

/* ── Leads page client ──────────────────────────────────────────────────── */

export default function LeadsClient({ leads, currency }: { leads: Lead[]; currency: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'All' && lead.status !== statusFilter) return false;
      if (!q) return true;
      return [lead.name, lead.email, lead.company]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, search, statusFilter]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await deleteLead(deleteTarget.id);
    setBusy(false);
    if (res.ok) {
      toast('Lead deleted.', 'success');
      setDeleteTarget(null);
    } else {
      toast(res.error, 'error');
    }
  }

  async function handleConvert() {
    if (!convertTarget) return;
    setBusy(true);
    const res = await convertLeadToCustomer(convertTarget.id);
    setBusy(false);
    if (res.ok) {
      toast(`${convertTarget.name} converted to a customer.`, 'success');
      setConvertTarget(null);
    } else {
      toast(res.error, 'error');
    }
  }

  const columns: Column<Lead>[] = [
    {
      header: 'Name',
      render: (lead) => (
        <div>
          <p className="font-medium text-ink-900">{lead.name}</p>
          {lead.company && <p className="text-xs text-ink-500">{lead.company}</p>}
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (lead) => (
        <div className="text-xs">
          {lead.email ? <p>{lead.email}</p> : <p className="text-ink-400">—</p>}
          {lead.phone && <p className="text-ink-500">{lead.phone}</p>}
        </div>
      ),
    },
    {
      header: 'Service',
      render: (lead) => lead.service_interested ?? <span className="text-ink-400">—</span>,
    },
    {
      header: 'Value',
      render: (lead) =>
        lead.estimated_value != null ? (
          <span className="font-medium">{formatMoney(lead.estimated_value, currency)}</span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      header: 'Status',
      render: (lead) => <Badge color={LEAD_BADGE_COLORS[lead.status]}>{lead.status}</Badge>,
    },
    {
      header: 'Follow-up',
      render: (lead) => <span className="whitespace-nowrap">{formatDate(lead.follow_up_date)}</span>,
    },
    {
      header: 'Actions',
      className: 'whitespace-nowrap',
      render: (lead) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => openEdit(lead)} aria-label={`Edit ${lead.name}`}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setConvertTarget(lead)}
            disabled={lead.status === 'Won'}
            title={lead.status === 'Won' ? 'Already converted' : `Convert ${lead.name} to a customer`}
            aria-label={`Convert ${lead.name} to a customer`}
          >
            Convert
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTarget(lead)}
            aria-label={`Delete ${lead.name}`}
            className="text-clay-600 hover:bg-clay-50 hover:text-clay-700"
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
        title="Leads"
        subtitle="Track every enquiry from first contact to won."
        actions={<Button onClick={openAdd}>Add lead</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            name="search"
            placeholder="Search name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>
        <div className="sm:w-48">
          <Select
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'All', label: 'All statuses' }, ...LEAD_STATUSES.map((s) => ({ value: s, label: s }))]}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
          description={
            leads.length === 0
              ? 'Add your first lead to start tracking enquiries.'
              : 'Try a different search or status filter.'
          }
          action={leads.length === 0 ? <Button onClick={openAdd}>Add lead</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} ariaLabel="Leads" />
      )}

      <LeadForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete lead"
        message={`Delete ${deleteTarget?.name ?? 'this lead'}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={busy}
      />

      <ConfirmDialog
        open={!!convertTarget}
        title="Convert to customer"
        message={`Convert ${convertTarget?.name ?? 'this lead'} to a customer? The lead will be marked Won.`}
        confirmLabel="Convert"
        onConfirm={handleConvert}
        onCancel={() => setConvertTarget(null)}
        loading={busy}
      />
    </div>
  );
}
