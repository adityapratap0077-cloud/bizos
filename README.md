<div align="center">

# BIZOS

### Run your business from one simple dashboard

![BizOS](https://img.shields.io/badge/BIZOS-2026-%23F2F0EB?style=for-the-badge&labelColor=%23060608)
![Status](https://img.shields.io/badge/STATUS-LIVE-%237A1212?style=for-the-badge&labelColor=%23060608)
![Stack](https://img.shields.io/badge/STACK-NEXT.JS_+_SUPABASE-%23060608?style=for-the-badge&labelColor=%23060608)
![Cost](https://img.shields.io/badge/COST-%240_FREE_TIER-%23060608?style=for-the-badge&labelColor=%23060608)

A zero-cost Business OS for freelancers and small businesses —
**leads, customers, tasks, bookings and invoices** in one dashboard.

[Live Demo](https://bizos-gamma.vercel.app) • [GitHub](https://github.com/adityapratap0077-cloud/bizos)

</div>

---

## What it does

BizOS turns the chaos of running a small business into one calm screen.
Sign up, and your business is provisioned automatically — then track a lead
from first contact to paid invoice without leaving the app:

- **Dashboard** — live revenue, counts and recent activity at a glance
- **Leads** — capture prospects, convert them to customers in one click
- **Customers** — profiles with full history (customers/[id])
- **Tasks** — track follow-ups and to-dos
- **Bookings** — schedule and manage appointments
- **Invoices** — raise numbered invoices (INV-0001, INV-0002…), mark paid, download as PDF
- **Settings & Profile** — business details, currency, account management
- **Activity log** — every action recorded per business

## Tech

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 16 (App Router) · TypeScript (strict) · React 19 |
| Styling | Tailwind CSS |
| Backend | Supabase — Auth + PostgreSQL + Row Level Security |
| PDF | jsPDF, generated fully client-side |
| Deploy | Vercel |

**Runtime dependencies:** `@supabase/supabase-js`, `@supabase/ssr`, `jspdf` —
nothing else. No paid APIs, no paid dependencies.

## Data isolation

Every business-owned row carries `business_id`. Row Level Security policies
allow access only when the business belongs to the signed-in user
(`owner_id = auth.uid()`). Server actions resolve the tenant via
`requireBusiness()` on every request — client-supplied IDs are never trusted.
The anon key is the only key ever used; the service-role key is never in the
app.

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/adityapratap0077-cloud/bizos.git
cd bizos
npm install
```

### 2. Create a free Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a
**free** project. Wait for provisioning to finish (1–2 minutes).

### 3. Add the environment variables

```bash
cp .env.example .env.local
```

Then open your Supabase project → **Project Settings → API** and copy:

| Variable | Where to find it |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |

> **Security note:** BizOS never uses the Supabase **service-role** key. Every
> query runs with the anon key under strict Row Level Security, so a user can
> only ever read or modify their own business data. Do not add a service-role
> key anywhere.

### 4. Run the database schema

1. In Supabase, open the **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/001_initial.sql` and press **Run**.

This creates all tables (`profiles`, `businesses`, `leads`, `customers`,
`tasks`, `bookings`, `invoices`, `invoice_items`, `activity_logs`), enables
Row Level Security with owner-only policies, and installs two triggers:

- `on_auth_user_created` — when a user signs up, a `profiles` row and a default `businesses` row are created automatically.
- `set_updated_at_trigger` — keeps `updated_at` fresh on every update.

It also installs `next_invoice_number(business_id)`, a race-safe per-business
invoice-number generator (`INV-0001`, `INV-0002`, …).

### 5. Run the application locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):

1. **Sign up** with email + password (check your inbox if email confirmation is on).
2. **Sign in** — your business is provisioned automatically.
3. Add your business details in **Settings**, then add a **lead**, convert it to a
   **customer**, create a **task**, schedule a **booking**, raise an **invoice**,
   mark it **paid**, and watch the **dashboard** light up.

Type-check without running the dev server:

```bash
npm run typecheck
```

### 6. Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the repository.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. **Deploy.** No build configuration is needed — the defaults work.

> If sign-in redirects loop after deploying, check that the env vars are set on
> the **Production** environment in Vercel and redeploy.

---

## Troubleshooting

| Problem | Fix |
| :--- | :--- |
| `Missing NEXT_PUBLIC_SUPABASE_URL` at runtime | `.env.local` is missing or not loaded — restart `npm run dev` after creating it. |
| Signup succeeds but login says "Email not confirmed" | Supabase → Authentication → Sign In / Up → disable "Confirm email" (or confirm via the email link). |
| `permission denied for table …` | The migration wasn't run, or was run partially — re-run `001_initial.sql` fully. |
| Invoice numbers collide / `next_invoice_number` fails | The function needs the `authenticated` grant from the migration — re-run the Grants section. |
| PDF download does nothing | Check the browser console; invoice PDFs are generated fully client-side with jsPDF — no server needed. |
| `npm run build` type errors after editing | Run `npm run typecheck` and fix the reported file/line — the build is strict. |

---

## Project structure

```
src/
  app/
    page.tsx                 # Public landing page
    login/  signup/          # Auth pages (Supabase Auth, email+password)
    (app)/                   # Protected routes (guarded by src/proxy.ts)
      layout.tsx             # Resolves business server-side, renders AppShell
      dashboard/ leads/ customers/ customers/[id]/
      tasks/ bookings/ invoices/ invoices/[id]/
      settings/ profile/
  actions/                   # Server actions (mutations + validation + RLS)
  components/
    ui.tsx                   # Button, Input, Select, Modal, Table, Badge, …
    Toast.tsx                # Toast provider + useToast()
    AppShell.tsx             # Sidebar (desktop) + drawer (mobile)
  lib/
    supabase/                # Browser + server Supabase clients (anon key only)
    business.ts              # requireBusiness() — server-side tenant resolution
    validations.ts           # Hand-rolled validation (client + server)
    pdf.ts                   # jsPDF invoice generator
    currency.ts              # formatMoney() + currency list
    activity.ts              # Activity-log helper
    types.ts                 # DB types
supabase/migrations/001_initial.sql
```

---

## Extension points

V1 is deliberately structured so features plug in without rewrites:

- **Subscriptions** — new `subscriptions` table + a `billing/` route; the Settings page already has a "Coming soon" integrations grid.
- **AI assistant** — floating panel in `AppShell`, provider called server-side (key in env, never client).
- **WhatsApp automation** — webhook route + `message_templates` table, queued outbox-style.
- **Email reminders** — Vercel Cron + Supabase SMTP.
- **Team members** — `business_members` table; widen RLS from `owner_id = auth.uid()` to "member of business".

**Free-plan rule:** nothing in V1 costs money. PDFs render in the browser,
charts are hand-rolled SVG/CSS, and logos are plain image URLs.

---

**Aditya Pratap** — Creative Technologist
Gorakhpur, India — github.com/adityapratap0077-cloud
