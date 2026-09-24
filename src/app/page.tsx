import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'BizOS — Run your business from one simple dashboard',
  description:
    'BizOS brings your leads, customers, tasks, bookings and invoices into one free dashboard — built for freelancers and small businesses.',
};

export default function LandingPage() {
  return <LandingClient />;
}
