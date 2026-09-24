# PRODUCT.md — BizOS (remake)

## What it is

BizOS is a free business operating system for freelancers and small businesses: one dashboard for **leads, customers, tasks, bookings, and invoices**, behind email/password auth.

## Mode

**Operate.** The user opens it to do work: log a lead, follow up, record a task, confirm a booking, send an invoice. Expression must never obscure the task, the state, or a familiar affordance. Speed and scanability beat decoration.

## Product truth

- Pages: landing, login, signup, dashboard, leads, customers (list + detail), tasks, bookings, invoices (list + detail + PDF), settings, profile.
- Stack: Next.js 16 + TypeScript + Tailwind, Supabase auth + PostgreSQL, Vercel hosting. Zero-cost tier.
- Auth: email/password via Supabase. RLS on all business data.
- Invoices: auto-numbered (`INV-0001` …), line items, draft/pending/paid states, client-side PDF generation.
- Activity log: every create/update/delete is recorded and shown on the dashboard.
- Currency: configurable per business (settings); amounts formatted consistently.
- Multi-tenancy: one business per user, isolated by RLS.

## Confirmed claims (safe to state in UI)

- "Free" — no paid tier exists; signup says "No credit card required".
- Modules: Leads, Customers, Tasks, Bookings, Invoices. Nothing else.
- This remake changes the interface only. All data behavior, validation, RLS, and PDF logic are preserved from the original.

## Assumptions (marked, not verified)

- The audience is solo operators in India (Android-first, per the owner's device preference); mobile UX is therefore treated as primary, not an afterthought.
- Feature bento on the landing describes only modules that exist in the app.

## Brand commitments (standing)

- Name: **BizOS**. One brand accent: pine green. No purple gradients, no generic SaaS glow.
- Design read: a precise, confident, ledger-inspired operating tool. Ink-black surfaces where weight belongs (sidebar), paper-white work areas.
