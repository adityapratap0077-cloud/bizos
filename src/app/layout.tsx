import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { ChatWidget } from '@/components/ChatWidget';

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
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
