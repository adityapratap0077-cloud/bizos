# BizOS — Run your business from one simple dashboard

BizOS is a free, zero-cost **Business OS** for freelancers and small businesses:
manage **leads, customers, tasks, bookings and invoices** from one simple dashboard.

- **Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (Auth + PostgreSQL + Row Level Security) · Vercel
- **Cost:** $0 — only free-tier services, no paid APIs, no paid dependencies
- **Runtime dependencies:** `@supabase/supabase-js`, `@supabase/ssr`, `jspdf` — nothing else

---

## 1. Clone the repository

```bash
git clone https://github.com/<your-username>/bizos.git
cd bizos
npm install
```

## 2. Create a free Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a **free** project.
2. Wait for the project to finish provisioning (1–2 minutes).

## 3. Add the environment variables

```bash
cp .env.example .env.local
```

Then open your Supabase project → **Project Settings → API** and copy:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |

> **Security note:** BizOS never uses the Supabase **service-role** key. Every query
> runs with the anon key under strict Row Level Security, so a user can only ever
> read or modify their own business data. Do not add a service-role key anywhere.

## 4. Run the database schema

1. In Supabase, open the **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/001_initial.sql` and press **Run**.

This creates all tables (`profiles`, `businesses`, `leads`, `customers`, `tasks`,
`bookings`, `invoices`, `invoice_items`, `activity_logs`), enables Row Level
Security with owner-only policies, and installs two triggers:

- `on_auth_user_created` — when a user signs up, a `profiles` row and a default
  `businesses` row are created automatically.
- `set_updated_at_trigger` — keeps `updated_at` fresh on every update.

It also installs `next_invoice_number(business_id)`, a race-safe per-business
invoice-number generator (`INV-0001`, `INV-0002`, …).

## 5. Run the application locally

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

## 6. Deploy to Vercel

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
|---|---|
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
    page.tsx                  # Public landing page
    login/  signup/           # Auth pages (Supabase Auth, email+password)
    (app)/                   # Protected routes (guarded by src/proxy.ts)
      layout.tsx              # Resolves business server-side, renders AppShell
      dashboard/ leads/ customers/ customers/[id]/
      tasks/ bookings/ invoices/ invoices/[id]/
      settings/ profile/
  actions/                    # Server actions (mutations + validation + RLS)
  components/
    ui.tsx                    # Button, Input, Select, Modal, Table, Badge, …
    Toast.tsx                 # Toast provider + useToast()
    AppShell.tsx              # Sidebar (desktop) + drawer (mobile)
  lib/
    supabase/                 # Browser + server Supabase clients (anon key only)
    business.ts               # requireBusiness() — server-side tenant resolution
    validations.ts            # Hand-rolled validation (client + server)
    pdf.ts                    # jsPDF invoice generator
    currency.ts               # formatMoney() + currency list
    activity.ts               # Activity-log helper
    types.ts                  # DB types
supabase/migrations/001_initial.sql
```

### Data isolation

Every business-owned row carries `business_id`. RLS policies allow access only when
`business_id` belongs to a business whose `owner_id = auth.uid()`. Server actions
resolve the business via `requireBusiness()` on every request — client-supplied
`business_id` values are never trusted.

---

## Future architecture — extension points

V1 is deliberately structured so paid features plug in without rewrites:

| Future feature | Where it plugs in |
|---|---|
| Stripe / Razorpay subscriptions | New `subscriptions` table (FK → `businesses`) + a `src/app/(app)/billing/` route; gate features with a `plan` column on `businesses`. The Settings page already has a "Coming soon" integrations grid. |
| AI assistant | New `src/app/api/assistant/route.ts` calling the provider server-side (key in env, never client); UI as a floating panel in `AppShell`. |
| WhatsApp automation | Webhook route `src/app/api/whatsapp/route.ts` + `message_templates` table; queue via `activity_logs`-style `outbox` table. |
| Email reminders | Vercel Cron hitting `src/app/api/reminders/route.ts`; free via Supabase SMTP or Resend free tier. |
| Recurring invoices | `recurrence` columns on `invoices` + a cron job that clones due invoices. |
| Team members | `business_members(business_id, user_id, role)` table; widen RLS policies from `owner_id = auth.uid()` to "member of business". |
| Multiple businesses | Drop the `businesses_owner_unique` constraint; add a business switcher in `AppShell` backed by a cookie. |
| Custom branding | Extend `businesses` with `brand_color`, `invoice_template`; `generateInvoicePdf` already takes the business record. |
| Client portal | New `(portal)` route group with token-based access (`portal_tokens` table), reusing the same actions. |
| Advanced analytics | New `src/app/(app)/reports/` pages aggregating the existing tables; charts stay dependency-free. |

**Free-plan rule:** nothing in V1 costs money. No Stripe/Razorpay keys, no WhatsApp
API, no OpenAI key, no paid email/analytics/storage. PDFs render in the browser,
charts are hand-rolled SVG/CSS, and logos are plain image URLs.
