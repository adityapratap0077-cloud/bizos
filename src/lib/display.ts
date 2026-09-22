/**
 * Shared display helpers: badge colors per status, date formatting,
 * and relative timestamps. Pure functions — safe on server and client.
 */
import type {
  BookingStatus,
  InvoiceStatus,
  LeadStatus,
  TaskPriority,
  TaskStatus,
} from './types';

type BadgeColor = 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'indigo' | 'purple';

export const LEAD_BADGE_COLORS: Record<LeadStatus, BadgeColor> = {
  New: 'blue',
  Contacted: 'yellow',
  Qualified: 'purple',
  Proposal: 'indigo',
  Won: 'green',
  Lost: 'red',
};

export const TASK_BADGE_COLORS: Record<TaskStatus, BadgeColor> = {
  Todo: 'gray',
  'In progress': 'yellow',
  Completed: 'green',
};

export const PRIORITY_BADGE_COLORS: Record<TaskPriority, BadgeColor> = {
  Low: 'gray',
  Medium: 'yellow',
  High: 'red',
};

export const BOOKING_BADGE_COLORS: Record<BookingStatus, BadgeColor> = {
  Scheduled: 'yellow',
  Completed: 'green',
  Cancelled: 'red',
};

export const INVOICE_BADGE_COLORS: Record<InvoiceStatus, BadgeColor> = {
  Draft: 'gray',
  Pending: 'yellow',
  Paid: 'green',
};

/** Format a YYYY-MM-DD (or ISO) date for display. Returns '—' for empty. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative timestamp like "5m ago", "3h ago", "yesterday"; falls back to a date. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  if (diff < 0) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}
