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

export type BadgeColor = 'ink' | 'pine' | 'gold' | 'clay' | 'sky' | 'grape';

export const LEAD_BADGE_COLORS: Record<LeadStatus, BadgeColor> = {
  New: 'sky',
  Contacted: 'gold',
  Qualified: 'grape',
  Proposal: 'ink',
  Won: 'pine',
  Lost: 'clay',
};

export const TASK_BADGE_COLORS: Record<TaskStatus, BadgeColor> = {
  Todo: 'ink',
  'In progress': 'gold',
  Completed: 'pine',
};

export const PRIORITY_BADGE_COLORS: Record<TaskPriority, BadgeColor> = {
  Low: 'ink',
  Medium: 'gold',
  High: 'clay',
};

export const BOOKING_BADGE_COLORS: Record<BookingStatus, BadgeColor> = {
  Scheduled: 'gold',
  Completed: 'pine',
  Cancelled: 'clay',
};

export const INVOICE_BADGE_COLORS: Record<InvoiceStatus, BadgeColor> = {
  Draft: 'ink',
  Pending: 'gold',
  Paid: 'pine',
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
