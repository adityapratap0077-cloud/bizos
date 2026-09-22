/** Currency formatting helpers (zero dependencies). */

export interface CurrencyOption {
  code: string;
  label: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
  { code: 'BRL', label: 'BRL — Brazilian Real' },
];

export function formatMoney(amount: number | null | undefined, currency = 'INR'): string {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return `${currency} 0.00`;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

/** Round to 2 decimal places for money math. */
export function toMoney(n: number): number {
  return Math.round((Number(n) || 0) * 100) / 100;
}
