import {
  BOOKING_STATUSES,
  INVOICE_STATUSES,
  LEAD_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from './types';

/**
 * Hand-rolled validation (zero dependencies).
 * Used by BOTH client forms (fast feedback) and server actions
 * (authoritative — client input is never trusted).
 */

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

function required(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function isNonNegativeNumber(value: unknown): boolean {
  if (value === '' || value === undefined || value === null) return true;
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0;
}

function isValidDate(value: unknown): boolean {
  if (value === '' || value === undefined || value === null) return true;
  return !Number.isNaN(Date.parse(String(value)));
}

export function validateCredentials(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  const email = String(data.email ?? '');
  const password = String(data.password ?? '');
  if (!required(email)) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!required(password)) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

export function validateLead(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.name)) errors.name = 'Name is required.';
  if (required(data.email) && !isValidEmail(String(data.email)))
    errors.email = 'Enter a valid email address.';
  if (!isNonNegativeNumber(data.estimated_value))
    errors.estimated_value = 'Estimated value must be a non-negative number.';
  if (data.status && !LEAD_STATUSES.includes(data.status as (typeof LEAD_STATUSES)[number]))
    errors.status = 'Invalid status.';
  if (!isValidDate(data.follow_up_date)) errors.follow_up_date = 'Enter a valid date.';
  return errors;
}

export function validateCustomer(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.name)) errors.name = 'Name is required.';
  if (required(data.email) && !isValidEmail(String(data.email)))
    errors.email = 'Enter a valid email address.';
  return errors;
}

export function validateTask(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.title)) errors.title = 'Task title is required.';
  if (data.priority && !TASK_PRIORITIES.includes(data.priority as (typeof TASK_PRIORITIES)[number]))
    errors.priority = 'Invalid priority.';
  if (data.status && !TASK_STATUSES.includes(data.status as (typeof TASK_STATUSES)[number]))
    errors.status = 'Invalid status.';
  if (!isValidDate(data.due_date)) errors.due_date = 'Enter a valid date.';
  return errors;
}

export function validateBooking(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.customer_id)) errors.customer_id = 'Choose a customer.';
  if (!required(data.service)) errors.service = 'Service is required.';
  if (!required(data.booking_date)) errors.booking_date = 'Date is required.';
  else if (!isValidDate(data.booking_date)) errors.booking_date = 'Enter a valid date.';
  if (!required(data.start_time)) errors.start_time = 'Start time is required.';
  if (!required(data.end_time)) errors.end_time = 'End time is required.';
  if (
    required(data.start_time) &&
    required(data.end_time) &&
    String(data.end_time) <= String(data.start_time)
  ) {
    errors.end_time = 'End time must be after start time.';
  }
  if (!isNonNegativeNumber(data.price)) errors.price = 'Price must be a non-negative number.';
  if (
    data.status &&
    !BOOKING_STATUSES.includes(data.status as (typeof BOOKING_STATUSES)[number])
  )
    errors.status = 'Invalid status.';
  return errors;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export function validateInvoice(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.customer_id)) errors.customer_id = 'Choose a customer.';
  if (!required(data.issue_date)) errors.issue_date = 'Issue date is required.';
  if (!isValidDate(data.due_date)) errors.due_date = 'Enter a valid date.';
  if (
    data.status &&
    !INVOICE_STATUSES.includes(data.status as (typeof INVOICE_STATUSES)[number])
  )
    errors.status = 'Invalid status.';
  const taxRate = Number(data.tax_rate ?? 0);
  if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100)
    errors.tax_rate = 'Tax rate must be between 0 and 100.';
  if (!isNonNegativeNumber(data.discount)) errors.discount = 'Discount must be non-negative.';

  const items = data.items as InvoiceItemInput[] | undefined;
  if (!Array.isArray(items) || items.length === 0) {
    errors.items = 'Add at least one line item.';
  } else {
    items.forEach((item, i) => {
      if (!required(item.description)) errors[`items.${i}.description`] = 'Description is required.';
      const qty = Number(item.quantity);
      if (Number.isNaN(qty) || qty <= 0) errors[`items.${i}.quantity`] = 'Qty must be greater than 0.';
      const price = Number(item.unit_price);
      if (Number.isNaN(price) || price < 0)
        errors[`items.${i}.unit_price`] = 'Price must be 0 or more.';
    });
  }
  return errors;
}

export function validateBusinessSettings(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (!required(data.name)) errors.name = 'Business name is required.';
  if (required(data.email) && !isValidEmail(String(data.email)))
    errors.email = 'Enter a valid email address.';
  if (required(data.logo_url)) {
    try {
      const url = new URL(String(data.logo_url));
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol');
    } catch {
      errors.logo_url = 'Enter a valid http(s) logo URL.';
    }
  }
  const taxRate = Number(data.tax_rate ?? 0);
  if (Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100)
    errors.tax_rate = 'Tax rate must be between 0 and 100.';
  if (!required(data.currency)) errors.currency = 'Choose a currency.';
  return errors;
}

export function validateProfile(data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};
  if (data.full_name !== undefined && !required(data.full_name))
    errors.full_name = 'Name cannot be empty.';
  return errors;
}
