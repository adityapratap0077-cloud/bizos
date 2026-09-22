import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BizOS — Run your business from one simple dashboard',
  description:
    'BizOS brings your leads, customers, tasks, bookings and invoices into one free dashboard — built for freelancers and small businesses.',
};

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#free-plan', label: 'Free plan' },
  { href: '#faq', label: 'FAQ' },
];

const features = [
  {
    title: 'Lead pipeline',
    body: 'Capture every enquiry and move it through your pipeline, from first contact to won or lost — nothing slips through the cracks.',
  },
  {
    title: 'Customers',
    body: 'Keep a simple directory of the people you do business with: contact details, notes and history in one place.',
  },
  {
    title: 'Tasks',
    body: 'Track what needs doing with priorities and due dates, so the day-to-day of the business stays visible.',
  },
  {
    title: 'Bookings',
    body: 'Schedule appointments and services with customers, and see what is coming up at a glance.',
  },
  {
    title: 'Invoices & PDFs',
    body: 'Create professional invoices with line items and tax, then download them as PDF files to send to your customers.',
  },
  {
    title: 'Dashboard & activity',
    body: 'One screen that shows your open leads, upcoming bookings, pending invoices and a log of recent activity.',
  },
];

const steps = [
  {
    n: '1',
    title: 'Create your free account',
    body: 'Sign up with just an email and password. No credit card, no setup calls.',
  },
  {
    n: '2',
    title: 'Add your business details',
    body: 'Enter your business name and currency in Settings so your invoices and dashboard reflect who you are.',
  },
  {
    n: '3',
    title: 'Add a lead and get going',
    body: 'Add a lead, convert it to a customer when they say yes, then send an invoice — all from the same dashboard.',
  },
];

const comingSoon = ['Subscriptions', 'WhatsApp automation', 'AI assistant', 'Email reminders'];

const faqs = [
  {
    q: 'Is BizOS really free?',
    a: 'Yes. Every feature in V1 — leads, customers, tasks, bookings, invoices and the dashboard — is free to use. BizOS runs on the free tiers of Next.js, Supabase and Vercel, and there are no paid plans at the moment.',
  },
  {
    q: 'Do I need a credit card?',
    a: 'No. Signing up only asks for an email and a password. There is nothing to pay for and no card to enter.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. BizOS uses Row Level Security on the database, which means your account can only ever read and write your own business data. Other users cannot see it.',
  },
  {
    q: 'Can I download invoices as PDF?',
    a: 'Yes. Every invoice can be downloaded as a PDF file that you can send to your customers by email or any channel you use.',
  },
  {
    q: 'What happens to my data if I leave?',
    a: 'Your data belongs to you. If you decide to leave, you can delete your account data from Settings and it is removed from the database.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Sticky nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            BizOS
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Run your business from one simple dashboard.
              </h1>
              <p className="mt-5 text-lg text-gray-600">
                BizOS brings your leads, customers, tasks, bookings and invoices
                into one free dashboard — built for freelancers and small businesses.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 sm:w-auto"
                >
                  Start free
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                  Sign in
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Free during beta · No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Everything you need, in one place
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
              One dashboard covers the everyday operations of a small business —
              from first enquiry to paid invoice.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Free plan ────────────────────────────────────────────── */}
        <section id="free-plan" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Free, by design.</h2>
              <p className="mt-4 text-gray-600">
                Every V1 feature is free — the lead pipeline, customers, tasks,
                bookings, invoices with PDF download, and the dashboard. BizOS
                runs on the free tiers of Supabase, Next.js and Vercel, so the
                cost of running it is zero, and no paid tiers exist yet.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">
                On the roadmap — not available yet
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {comingSoon.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                    <button
                      type="button"
                      disabled
                      aria-label={`${item}: coming soon, not available yet`}
                      className="inline-flex cursor-not-allowed items-center rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 opacity-70"
                    >
                      Coming soon
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 bg-gray-50">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                >
                  <summary className="cursor-pointer list-none text-base font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <svg
                        className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-gray-300">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xl font-bold tracking-tight text-white">BizOS</p>
              <p className="mt-1 text-sm text-gray-400">
                Run your business from one simple dashboard.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm font-medium text-gray-300 hover:text-white">
                Get started
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-800 pt-6 text-xs text-gray-500">
            Built with Next.js, Supabase and Vercel free tiers.
          </p>
        </div>
      </footer>
    </div>
  );
}
