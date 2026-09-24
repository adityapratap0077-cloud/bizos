'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import Lenis from 'lenis';
import {
  UsersThree,
  Receipt,
  CalendarBlank,
  Checks,
  User,
  ChartLineUp,
  ArrowRight,
  Funnel,
  FilePdf,
  Bell,
  Check,
} from '@phosphor-icons/react';

/* ── Small building blocks ─────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* A real, miniature product preview — actual UI shapes, not a fake screenshot. */
function ProductPreview() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32, rotate: 0.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
      className="relative"
      aria-label="Preview of the BizOS dashboard"
    >
      <div className="rounded-surface border border-ink-200 bg-white p-4 shadow-pop sm:p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-tight text-ink-950">Dashboard</p>
          <span className="rounded-full bg-pine-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-pine-800">
            Live
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { l: 'Leads', v: '24' },
            { l: 'Bookings', v: '7' },
            { l: 'Due', v: '₹18.2k' },
          ].map((s) => (
            <div key={s.l} className="rounded-control border border-ink-100 bg-ink-50/70 p-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-500">{s.l}</p>
              <p className="tnum mt-1 font-display text-lg font-bold text-ink-950">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {[
            { n: 'Website enquiry', s: 'New', w: '38%', c: 'bg-sky-500' },
            { n: 'Salon booking', s: 'Confirmed', w: '64%', c: 'bg-pine-500' },
            { n: 'Invoice INV-0042', s: 'Paid', w: '100%', c: 'bg-pine-600' },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3 rounded-control border border-ink-100 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink-800">{r.n}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    className={`h-full rounded-full ${r.c}`}
                    initial={reduce ? { width: r.w } : { width: 0 }}
                    animate={{ width: r.w }}
                    transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
                  />
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-500">
                {r.s}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Floating chips */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1, ease: EASE }}
        className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 shadow-card sm:-right-5"
      >
        <Check className="h-3.5 w-3.5 text-pine-600" weight="bold" aria-hidden="true" />
        <span className="text-xs font-semibold text-ink-800">Invoice paid</span>
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.15, ease: EASE }}
        className="absolute -bottom-4 -left-3 flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 shadow-card sm:-left-5"
      >
        <Bell className="h-3.5 w-3.5 text-gold-500" weight="fill" aria-hidden="true" />
        <span className="text-xs font-semibold text-ink-800">3 follow-ups due</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Funnel,
    title: 'Lead pipeline',
    body: 'Capture every enquiry and move it through your pipeline, from first contact to won or lost — nothing slips through the cracks.',
    visual: (
      <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden="true">
        {['New', 'Contacted', 'Qualified', 'Proposal', 'Won'].map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              i === 4 ? 'bg-pine-600 text-white' : 'bg-ink-100 text-ink-600'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    ),
    large: true,
  },
  {
    icon: Receipt,
    title: 'Invoices & PDFs',
    body: 'Create professional invoices with line items and tax, then download them as PDF files to send to your customers.',
    visual: (
      <div className="mt-5 rounded-control border border-ink-200 bg-white p-3" aria-hidden="true">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] font-semibold text-ink-800">INV-0042</p>
          <span className="rounded-full bg-pine-100 px-2 py-0.5 text-[10px] font-bold text-pine-800">PAID</span>
        </div>
        <p className="tnum mt-2 font-display text-xl font-bold text-ink-950">₹24,500</p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
          <FilePdf className="h-3.5 w-3.5" aria-hidden="true" /> Download PDF
        </div>
      </div>
    ),
  },
  {
    icon: User,
    title: 'Customers',
    body: 'A simple directory of the people you do business with: contact details, notes and history in one place.',
    visual: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {['Aarav Mehta', 'Priya Nair'].map((n) => (
          <div key={n} className="flex items-center gap-2.5 rounded-control border border-ink-100 bg-white px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-100 font-display text-[11px] font-bold text-pine-800">
              {n[0]}
            </span>
            <span className="text-[13px] font-medium text-ink-800">{n}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Checks,
    title: 'Tasks',
    body: 'Track what needs doing with priorities and due dates, so the day-to-day of the business stays visible.',
    visual: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[
          { t: 'Call supplier', done: true },
          { t: 'Send quotation', done: false },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-2.5 text-[13px]">
            <span className={`flex items-center justify-center rounded border ${x.done ? 'border-pine-600 bg-pine-600' : 'border-ink-300'}`} style={{ width: 16, height: 16 }}>
              {x.done && <Check className="h-3 w-3 text-white" weight="bold" aria-hidden="true" />}
            </span>
            <span className={x.done ? 'text-ink-400 line-through' : 'font-medium text-ink-800'}>{x.t}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: CalendarBlank,
    title: 'Bookings',
    body: 'Schedule appointments and services with customers, and see what is coming up at a glance.',
    visual: (
      <div className="mt-5 grid grid-cols-7 gap-1" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-[4px] ${i === 4 || i === 9 ? 'bg-pine-600' : 'bg-ink-100'}`}
          />
        ))}
      </div>
    ),
  },
  {
    icon: ChartLineUp,
    title: 'Dashboard & activity',
    body: 'One screen showing open leads, upcoming bookings, pending invoices and a log of recent activity.',
    visual: (
      <div className="mt-5 flex h-16 items-end gap-1.5" aria-hidden="true">
        {[35, 55, 40, 70, 52, 88, 64].map((h, i) => (
          <span key={i} className={`flex-1 rounded-t ${i === 5 ? 'bg-pine-600' : 'bg-pine-200'}`} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your free account',
    body: 'Sign up with just an email and password. No credit card, no setup calls.',
  },
  {
    n: '02',
    title: 'Add your business details',
    body: 'Enter your business name and currency in Settings so your invoices and dashboard reflect who you are.',
  },
  {
    n: '03',
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

const pipeline = ['Lead', 'Customer', 'Booking', 'Invoice', 'Paid'];

export default function LandingClient() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduce]);

  return (
    <div className="min-h-dvh bg-ink-50 text-ink-900">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/90 backdrop-blur">
        <nav className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Site">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-pine-600 font-display text-sm font-bold text-white" aria-hidden="true">
              B
            </span>
            <span className="font-display text-lg font-bold tracking-tight">BizOS</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {[
              ['#features', 'Features'],
              ['#how-it-works', 'How it works'],
              ['#free-plan', 'Free plan'],
              ['#faq', 'FAQ'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-ink-600 hover:text-ink-950">
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/login" className="pressable rounded-control px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">
              Sign in
            </Link>
            <Link href="/signup" className="pressable rounded-control bg-ink-950 px-4 py-2 text-sm font-semibold text-white shadow-press hover:bg-ink-800">
              Start free
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero (asymmetric split, left-aligned) ─────── */}
        <section className="overflow-hidden border-b border-ink-200/70">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
            <div>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-pine-700"
              >
                Free forever · No credit card
              </motion.p>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
                className="mt-4 font-display text-[40px] font-bold leading-[1.04] tracking-tight text-ink-950 sm:text-5xl lg:text-[60px]"
              >
                Run your business from one simple dashboard.
              </motion.h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
                className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-600"
              >
                Leads, customers, tasks, bookings and invoices — one free dashboard for freelancers
                and small businesses.
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/signup"
                  className="pressable inline-flex items-center justify-center gap-2 rounded-control bg-pine-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-card hover:bg-pine-700"
                >
                  Start free <ArrowRight className="h-4 w-4" weight="bold" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="pressable inline-flex items-center justify-center rounded-control border border-ink-200 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink-800 hover:border-ink-300"
                >
                  Sign in
                </Link>
              </motion.div>
            </div>
            <div className="lg:pl-4">
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* ── Pipeline strip (the one marquee) ───────────── */}
        <div className="overflow-hidden border-b border-ink-200/70 bg-white py-3.5" aria-hidden="true">
          <div className={`flex w-max items-center gap-8 ${reduce ? '' : 'animate-marquee'}`}>
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-8">
                {pipeline.map((p) => (
                  <span key={`${dup}-${p}`} className="flex items-center gap-8">
                    <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                      {p}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-pine-600" weight="bold" />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}.animate-marquee{animation:marquee 22s linear infinite}@media (prefers-reduced-motion:reduce){.animate-marquee{animation:none}}`}</style>
        </div>

        {/* ── Features bento ─────────────────────────────── */}
        <section id="features" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <h2 className="max-w-[16ch] font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                Everything you need, in one place
              </h2>
              <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-ink-600">
                One dashboard covers the everyday operations of a small business — from first enquiry
                to paid invoice.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={Math.min(i * 0.06, 0.24)} className={f.large ? 'sm:col-span-2 lg:col-span-2' : ''}>
                  <article className="hoverable h-full rounded-surface border border-ink-200/80 bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-pop">
                    <div className="flex h-10 w-10 items-center justify-center rounded-control bg-pine-100 text-pine-700">
                      <f.icon className="h-5 w-5" weight="duotone" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink-950">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{f.body}</p>
                    {f.visual}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works (editorial numbered list) ─────── */}
        <section id="how-it-works" className="scroll-mt-24 border-y border-ink-200/70 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                How it works
              </h2>
            </Reveal>
            <div className="mt-10">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className={`flex gap-6 py-8 ${i > 0 ? 'border-t border-ink-100' : ''} sm:gap-10 sm:py-10`}>
                    <span className="tnum shrink-0 font-display text-4xl font-bold text-pine-600/90 sm:text-5xl" aria-hidden="true">
                      {s.n}
                    </span>
                    <div className="max-w-xl">
                      <h3 className="font-display text-xl font-semibold tracking-tight text-ink-950">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Free plan ──────────────────────────────────── */}
        <section id="free-plan" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                Free, by design.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-600">
                Every V1 feature is free — the lead pipeline, customers, tasks, bookings, invoices
                with PDF download, and the dashboard. BizOS runs on the free tiers of Supabase,
                Next.js and Vercel, so the cost of running it is zero, and no paid tiers exist yet.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mx-auto mt-10 max-w-3xl rounded-surface border border-ink-200/80 bg-white p-6 shadow-card sm:p-8">
                <h3 className="font-display text-base font-semibold tracking-tight text-ink-950">
                  On the roadmap — not available yet
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {comingSoon.map((item) => (
                    <li
                      key={item}
                      className="flex items-center justify-between rounded-control border border-ink-100 bg-ink-50/70 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-ink-700">{item}</span>
                      <span className="rounded-full bg-ink-100 px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        Soon
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-ink-100 pt-6 text-center">
                  <Link
                    href="/signup"
                    className="pressable inline-flex items-center justify-center gap-2 rounded-control bg-pine-600 px-6 py-3 text-[15px] font-semibold text-white shadow-card hover:bg-pine-700"
                  >
                    Start free <ArrowRight className="h-4 w-4" weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-24 border-t border-ink-200/70 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                Frequently asked questions
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={Math.min(i * 0.05, 0.2)}>
                  <details className="group rounded-surface border border-ink-200/80 bg-ink-50/50 px-5 py-4">
                    <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {f.q}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 font-display text-lg leading-none text-ink-600 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-ink-600">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-ink-200/70">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-pine-600 font-display text-sm font-bold text-white" aria-hidden="true">
                B
              </span>
              <div>
                <p className="font-display text-base font-bold tracking-tight">BizOS</p>
                <p className="text-[13px] text-ink-500">Run your business from one simple dashboard.</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-ink-950">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm font-semibold text-pine-700 hover:text-pine-800">
                Get started
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-ink-100 pt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-400">
            Built with Next.js, Supabase and Vercel free tiers
          </p>
        </div>
      </footer>
    </div>
  );
}
