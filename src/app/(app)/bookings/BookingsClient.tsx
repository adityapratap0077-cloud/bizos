'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  createBooking,
  deleteBooking,
  updateBooking,
  type BookingInput,
} from '@/actions/bookings';
import { validateBooking, type FieldErrors } from '@/lib/validations';
import { formatMoney } from '@/lib/currency';
import type { BadgeColor } from '@/lib/display';
import {
  BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
} from '@/lib/types';

interface CustomerOption {
  id: string;
  name: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function badgeColor(status: BookingStatus): BadgeColor {
  if (status === 'Completed') return 'pine';
  if (status === 'Cancelled') return 'clay';
  return 'gold';
}

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function formatDateHeading(d: string): string {
  return new Date(d + 'T00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ── Booking form modal (create + edit) ─────────────────────────────────── */

function BookingForm({
  open,
  onClose,
  customers,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  customers: CustomerOption[];
  editing: Booking | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [service, setService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<BookingStatus>('Scheduled');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setCustomerId(editing.customer_id);
      setService(editing.service);
      setBookingDate(editing.booking_date);
      setStartTime(formatTime(editing.start_time));
      setEndTime(formatTime(editing.end_time));
      setPrice(editing.price === null ? '' : String(editing.price));
      setStatus(editing.status);
      setNotes(editing.notes ?? '');
    } else {
      setCustomerId('');
      setService('');
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setPrice('');
      setStatus('Scheduled');
      setNotes('');
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: BookingInput = {
      customer_id: customerId,
      service,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      price,
      status,
      notes,
    };

    const clientErrors = validateBooking(input as unknown as Record<string, unknown>);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      const result = editing
        ? await updateBooking(editing.id, input)
        : await createBooking(input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast(result.error, 'error');
        return;
      }
      toast(editing ? 'Booking updated.' : 'Booking created.', 'success');
      onClose();
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit booking' : 'New booking'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="booking-form" loading={saving}>
            {editing ? 'Save changes' : 'Create booking'}
          </Button>
        </>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Customer *"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          error={errors.customer_id}
          placeholder="Choose a customer"
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Input
          label="Service *"
          value={service}
          onChange={(e) => setService(e.target.value)}
          error={errors.service}
          placeholder="e.g. Haircut, Consultation"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Date *"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            error={errors.booking_date}
          />
          <Input
            label="Start time *"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            error={errors.start_time}
          />
          <Input
            label="End time *"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            error={errors.end_time}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            placeholder="Optional"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            error={errors.status}
            options={BOOKING_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything worth remembering about this booking"
        />
      </form>
    </Modal>
  );
}

/* ── Page client ────────────────────────────────────────────────────────── */

export default function BookingsClient({
  bookings,
  customers,
  currency,
}: {
  bookings: Booking[];
  customers: CustomerOption[];
  currency: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${b.customer_name ?? ''} ${b.service}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [bookings, statusFilter, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of filtered) {
      const list = map.get(b.booking_date);
      if (list) list.push(b);
      else map.set(b.booking_date, [b]);
    }
    return [...map.entries()];
  }, [filtered]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(booking: Booking) {
    setEditing(booking);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await deleteBooking(pendingDelete.id);
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      toast('Booking deleted.', 'success');
      setPendingDelete(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Your upcoming and past appointments, grouped by date."
        actions={
          <Button onClick={openNew} disabled={customers.length === 0}>
            New booking
          </Button>
        }
      />

      {customers.length === 0 && (
        <Card className="mb-6 border-gold-200 bg-gold-50">
          <p className="text-sm text-gold-800">
            You need at least one customer before you can create a booking. Add
            one from the Customers page first.
          </p>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="Search by customer or service"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search bookings"
        />
        <Select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | BookingStatus)}
          options={[
            { value: 'All', label: 'All statuses' },
            ...BOOKING_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Schedule your first appointment and it will show up here, grouped by date."
          action={
            customers.length > 0 ? (
              <Button onClick={openNew}>Create your first booking</Button>
            ) : undefined
          }
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No bookings match your filters"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([date, list]) => (
            <section key={date} aria-label={formatDateHeading(date)}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
                {formatDateHeading(date)}
              </h2>
              <div className="flex flex-col gap-3">
                {list.map((b) => (
                  <Card key={b.id} className="!p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-ink-700">{b.service}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-500">
                          {b.customer_name ?? 'Unknown customer'}
                          {b.notes ? ` · ${b.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {b.price !== null && (
                          <span className="text-sm font-semibold text-ink-900">
                            {formatMoney(b.price, currency)}
                          </span>
                        )}
                        <Badge color={badgeColor(b.status)}>{b.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!text-clay-600 hover:!bg-clay-50"
                          onClick={() => setPendingDelete(b)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BookingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customers={customers}
        editing={editing}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete booking?"
        message={`Delete the booking for "${pendingDelete?.service}" on ${pendingDelete ? formatDateHeading(pendingDelete.booking_date) : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </>
  );
}
