# PriskatCFM — Community Web App

A full-stack community platform for **Priskat CFM** built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- 📰 **News** — publish articles, categories, reactions, comments
- 📅 **Events** — RSVP with live count via Supabase Realtime, capacity enforcement
- 👥 **Member Directory** — searchable profiles with skills & interests
- 🔐 **Auth** — email/password + magic link via Supabase Auth
- 🛡️ **RLS** — Row Level Security enforced at the database layer for all tables
- ⚡ **ISR** — news feed and events list use Incremental Static Regeneration
- 🖼️ **Image Compression** — client-side compress + resize before upload (max 2MB, WebP)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Deployment | Vercel |

---

## Local Setup

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone & Install

```bash
cd "c:\000. Cloude AI\PriskatCFM"
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project credentials:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` secret key |

> ⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** It's only used in server actions and route handlers.

### 4. Database Setup

Run the migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_buckets.sql`

To promote your account to admin (replace the email):

```sql
UPDATE public.profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

### 5. Supabase Auth Configuration

In your Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `http://localhost:3000` (development) or your Vercel URL
- **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment on Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add the 3 environment variables from `.env.example` in Vercel project settings
4. Update Supabase Auth redirect URLs to your Vercel production URL

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, profile pages
│   ├── (public)/        # News, events, directory (public-facing)
│   ├── admin/           # Admin panel (role-protected)
│   ├── actions/         # Server actions (news.ts, events.ts)
│   └── auth/callback/   # Magic link / OAuth callback
├── components/
│   ├── admin/           # Admin-specific components
│   ├── directory/       # MemberCard, SearchBar
│   ├── events/          # RSVPButton, LiveRSVPCount, AttendeeList
│   ├── layout/          # Navbar, Footer
│   ├── news/            # NewsCard, CommentSection, ReactionButton
│   ├── profile/         # ProfileEditForm
│   ├── providers/       # SupabaseProvider (session context)
│   └── ui/              # Button, Badge, Modal, Pagination
└── lib/
    ├── supabase/        # client.ts, server.ts, admin.ts
    ├── types/           # database.types.ts
    ├── upload.ts        # Image compression + Storage upload
    └── utils.ts         # Date formatting, slugify, cn
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    └── 003_storage_buckets.sql
```

---

## Roles

| Role | Permissions |
|---|---|
| **admin** | Full access — manage posts, events, users, moderate all |
| **moderator** | Create/edit news and events, moderate comments |
| **member** | View content, RSVP, comment, react, edit own profile |

All role checks are enforced by Supabase RLS policies on every table. The frontend checks are a UX convenience only.

---

## Supabase Free Tier Tips

- Images are compressed to WebP ≤ 2MB before upload (client-side)
- All list views are paginated — never fetch full tables
- Realtime subscriptions are scoped narrowly (`event_id=eq.{id}`) — not entire tables
- ISR revalidation reduces database reads for public pages
