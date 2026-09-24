'use client';

import React, { useEffect, useRef } from 'react';
import { X, type Icon as PhosphorIcon } from '@phosphor-icons/react';
import type { BadgeColor } from '@/lib/display';

/**
 * Ledger UI kit — the BizOS design system.
 * Radius rule: surfaces 16px (rounded-surface), controls 12px (rounded-control),
 * status chips pill (rounded-full). Pine is the single locked accent.
 */

/* ── Button ─────────────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-pine-600 text-white shadow-press hover:bg-pine-700 focus-visible:ring-pine-600',
  secondary:
    'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50 focus-visible:ring-pine-600',
  danger:
    'bg-clay-600 text-white shadow-press hover:bg-clay-700 focus-visible:ring-clay-600',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 focus-visible:ring-pine-600',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-[15px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`pressable inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold disabled:cursor-not-allowed disabled:opacity-55 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

/* ── Form fields ────────────────────────────────────────────────────────── */
interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

function FieldWrapper({
  id,
  label,
  error,
  hint,
  children,
}: FieldProps & { id?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-clay-700">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'block w-full rounded-control border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 shadow-press placeholder:text-ink-400 focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20 disabled:bg-ink-100 disabled:text-ink-500';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {}

export function Input({ label, error, hint, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <FieldWrapper id={inputId} label={label} error={error} hint={hint}>
      <input
        id={inputId}
        {...rest}
        aria-invalid={!!error}
        className={`${inputClass} ${error ? 'border-clay-500 focus:border-clay-600 focus:ring-clay-600/20' : ''} ${className}`}
      />
    </FieldWrapper>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  options,
  placeholder,
  className = '',
  ...rest
}: SelectProps) {
  const inputId = id ?? rest.name;
  return (
    <FieldWrapper id={inputId} label={label} error={error} hint={hint}>
      <select
        id={inputId}
        {...rest}
        aria-invalid={!!error}
        className={`${inputClass} ${error ? 'border-clay-500 focus:border-clay-600 focus:ring-clay-600/20' : ''} ${className}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldProps {}

export function Textarea({ label, error, hint, id, className = '', ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <FieldWrapper id={inputId} label={label} error={error} hint={hint}>
      <textarea
        id={inputId}
        {...rest}
        aria-invalid={!!error}
        className={`${inputClass} ${error ? 'border-clay-500 focus:border-clay-600 focus:ring-clay-600/20' : ''} ${className}`}
      />
    </FieldWrapper>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */
export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-surface border border-ink-200/80 bg-white p-5 shadow-card sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ── Section title (card / panel headings) ──────────────────────────────── */
export function SectionTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`font-display text-[17px] font-semibold tracking-tight text-ink-900 ${className}`}>
      {children}
    </h2>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────────── */

const badgeColors: Record<BadgeColor, string> = {
  ink: 'bg-ink-100 text-ink-700',
  pine: 'bg-pine-100 text-pine-800',
  gold: 'bg-gold-100 text-gold-800',
  clay: 'bg-clay-100 text-clay-800',
  sky: 'bg-sky-100 text-sky-800',
  grape: 'bg-grape-100 text-grape-800',
};

export function Badge({
  color = 'ink',
  children,
  className = '',
}: {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[color]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-ink-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`anim-scale-in flex max-h-[92dvh] w-full flex-col rounded-t-surface border border-ink-200 bg-white shadow-pop outline-none sm:rounded-surface ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="pressable rounded-control p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            <X className="h-5 w-5" weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="thin-scroll overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-ink-100 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ConfirmDialog ──────────────────────────────────────────────────────── */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[15px] leading-relaxed text-ink-600">{message}</p>
    </Modal>
  );
}

/* ── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: PhosphorIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-surface border border-dashed border-ink-200 bg-ink-50/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pine-100 text-pine-700">
        {Icon ? (
          <Icon className="h-6 w-6" weight="duotone" aria-hidden="true" />
        ) : (
          <span className="font-display text-xl font-bold" aria-hidden="true">
            —
          </span>
        )}
      </div>
      <h3 className="font-display text-base font-semibold tracking-tight text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <svg
      className={`animate-spin text-current ${sizes[size]}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/* ── DataTable ────────────────────────────────────────────────────────────
 * Desktop: a real table. Mobile (<sm): the same rows as stacked cards —
 * first column becomes the card title, the Actions column becomes a
 * footer button row. No call-site changes needed.
 */
export interface Column<T> {
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  ariaLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  ariaLabel?: string;
}) {
  const [titleCol, ...restCols] = columns;
  const actionCol = restCols.find((c) => c.header === 'Actions');
  const infoCols = restCols.filter((c) => c !== actionCol);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-surface border border-ink-200/80 bg-white shadow-card sm:block">
        <table className="min-w-full divide-y divide-ink-100 text-sm" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500 ${c.className ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row, i) => (
              <tr key={rowKey(row, i)} className="hoverable hover:bg-ink-50/70">
                {columns.map((c, j) => (
                  <td key={j} className={`px-4 py-3.5 align-top text-ink-700 ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden" role="list" aria-label={ariaLabel}>
        {rows.map((row, i) => (
          <article
            key={rowKey(row, i)}
            role="listitem"
            className="rounded-surface border border-ink-200/80 bg-white p-4 shadow-card"
          >
            <div className="text-[15px] font-semibold text-ink-900">{titleCol.render(row)}</div>
            {infoCols.length > 0 && (
              <dl className="mt-3 space-y-2 border-t border-ink-100 pt-3">
                {infoCols.map((c, j) => (
                  <div key={j} className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-400">
                      {c.header}
                    </dt>
                    <dd className="text-right text-sm text-ink-700">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actionCol && (
              <div className="mt-3 border-t border-ink-100 pt-3 [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2">
                {actionCol.render(row)}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

/* ── PageHeader ─────────────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink-950 sm:text-[32px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-[60ch] text-[15px] text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── StatCard (dashboard) ───────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  sub,
  href,
  index = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  index?: number;
}) {
  const inner = (
    <>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-500">
        {label}
      </p>
      <p className="tnum mt-2 font-display text-[30px] font-bold leading-none tracking-tight text-ink-950">
        {value}
      </p>
      {sub && <p className="tnum mt-2 text-[13px] font-medium text-ink-500">{sub}</p>}
    </>
  );
  const cls =
    'stagger-in rounded-surface border border-ink-200/80 bg-white p-5 shadow-card pressable';
  const style = { '--i': index } as React.CSSProperties;
  if (href) {
    return (
      <a href={href} style={style} className={`${cls} hoverable block hover:-translate-y-0.5 hover:shadow-pop`}>
        {inner}
      </a>
    );
  }
  return (
    <div style={style} className={cls}>
      {inner}
    </div>
  );
}
