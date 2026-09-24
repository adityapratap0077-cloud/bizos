import type { Metadata } from 'next';
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

/**
 * Type system — "Ledger":
 * - Space Grotesk: display / headings. Geometric, confident, not the Inter default.
 * - Inter Tight: body / UI text. Neutral and highly legible, tighter than Inter.
 * - JetBrains Mono: numerals, eyebrows, invoice numbers. Tabular figures everywhere.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BizOS — Run your business from one simple dashboard',
    template: '%s — BizOS',
  },
  description:
    'BizOS is a free all-in-one dashboard for freelancers and small businesses: manage leads, customers, tasks, bookings and invoices from one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
