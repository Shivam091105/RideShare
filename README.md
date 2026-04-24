# 🚗 RideShare

A full-stack ridesharing web application built with React, TypeScript, and Supabase. Riders can post trip requests with pickup/dropoff locations and an offered fare; drivers can browse and accept available rides. The platform features real-time updates, an interactive map, in-app chat, payment simulation, and an admin dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Database Schema](#database-schema)
- [Application Routes](#application-routes)
- [Key Components](#key-components)
- [Supabase Setup](#supabase-setup)

---

## Features

- **Dual-role accounts** — Users can register as a Rider, Driver, or both.
- **Ride requesting** — Riders submit pickup/dropoff locations, an optional fare offer, and notes.
- **Driver marketplace** — Drivers browse all pending ride requests and accept them in one click.
- **Real-time updates** — Ride status changes are pushed instantly via Supabase Realtime (PostgreSQL `LISTEN/NOTIFY`).
- **Interactive map** — Embedded OpenStreetMap view via `react-leaflet` (defaults to Pune, India).
- **In-app chat** — Lightweight messaging built on top of the Supabase `notifications` table with live subscription.
- **Payment simulator** — Simulates ride payment flow backed by a `payments` table.
- **Admin panel** — Paginated table of all recent payments at `/admin`.
- **Authentication** — Email/password sign-up and sign-in handled entirely by Supabase Auth.
- **Row-level security** — All tables protected by Supabase RLS policies; riders see only their own rides, drivers see pending rides.
- **Containerised build** — Multi-stage Dockerfile produces a minimal nginx-served static bundle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Component library | shadcn/ui (Radix UI primitives) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Map | react-leaflet + OpenStreetMap |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Charts | Recharts |
| Container runtime | Docker + nginx |

---

## Project Structure

```
.
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (accordion, button, dialog…)
│   │   ├── enhancements/    # Added features
│   │   │   ├── MapView.tsx          # react-leaflet map widget
│   │   │   ├── Chat.tsx             # Real-time in-app chat
│   │   │   └── PaymentSimulator.tsx # Payment flow simulation
│   │   ├── DriverView.tsx   # Driver dashboard (available + accepted rides)
│   │   ├── RiderView.tsx    # Rider dashboard (request + track rides)
│   │   ├── RideCard.tsx     # Shared ride card with status actions
│   │   └── ProfileView.tsx  # User profile editor
│   ├── hooks/
│   │   ├── use-mobile.tsx   # Responsive breakpoint hook
│   │   └── use-toast.ts     # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client initialisation
│   │       └── types.ts     # Generated database types
│   ├── lib/
│   │   └── utils.ts         # Utility helpers (clsx, tailwind-merge)
│   ├── pages/
│   │   ├── Index.tsx        # Landing / marketing page
│   │   ├── Auth.tsx         # Sign-in / sign-up page
│   │   ├── Dashboard.tsx    # Main authenticated app shell
│   │   ├── AdminPanel.tsx   # Admin payments table
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Route declarations
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles & CSS custom properties
├── supabase/
│   ├── config.toml
│   └── migrations/          # SQL migration files
├── Dockerfile
├── .env                     # Environment variables (not committed)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (or Bun)
- **npm** ≥ 9
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### Environment Variables

Copy `.env` and fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-public-key>
```

Both values are found in your Supabase project under **Settings → API**.

### Local Development

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd ride-wizard

# 2. Install dependencies
npm ci

# 3. Add your Supabase credentials to .env (see above)

# 4. Start the dev server (hot-reload on http://localhost:5173)
npm run dev
```

Other useful scripts:

```bash
npm run build        # Production build → dist/
npm run build:dev    # Development build (unminified)
npm run preview      # Preview the production build locally
npm run lint         # Run ESLint
```

### Docker Deployment

The included `Dockerfile` uses a two-stage build: Node 18 Alpine compiles the app, then nginx Alpine serves the static files.

```bash
# Build the image
docker build -t ride-wizard .

# Run on port 80
docker run -p 80:80 ride-wizard
```

> **Note:** Supabase environment variables are baked in at build time by Vite. Pass them as build args or set them in `.env` before running `docker build`.

---

## Database Schema

The following tables are created by the migration files in `supabase/migrations/`.

### `profiles`

Extends `auth.users`. Created automatically via a trigger when a user signs up.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users` |
| `full_name` | TEXT | |
| `phone` | TEXT | Optional |
| `role` | `user_role` enum | `rider` / `driver` / `both` |
| `avatar_url` | TEXT | Optional |
| `rating` | DECIMAL(3,2) | Defaults to 5.0 |
| `total_rides` | INTEGER | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

### `rides`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `rider_id` | UUID | FK → `profiles` |
| `driver_id` | UUID | FK → `profiles`, nullable |
| `pickup_location` | TEXT | |
| `dropoff_location` | TEXT | |
| `pickup_lat/lng` | DECIMAL | Optional coordinates |
| `dropoff_lat/lng` | DECIMAL | Optional coordinates |
| `status` | `ride_status` enum | `pending` / `accepted` / `in_progress` / `completed` / `cancelled` |
| `fare` | DECIMAL(10,2) | Offered by rider |
| `distance_km` | DECIMAL | |
| `estimated_duration_min` | INTEGER | |
| `notes` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |
| `completed_at` | TIMESTAMPTZ | |

### `notifications`

Used as the backing store for the in-app chat component.

| Column | Notes |
|---|---|
| `id` | UUID (PK) |
| `user_id` | Sender |
| `title` | Set to `'chat'` for chat messages |
| `message` | Message body |
| `created_at` | |

### `payments`

Stores payment records created by the PaymentSimulator component.

| Column | Notes |
|---|---|
| `id` | UUID (PK) |
| `payer_id` | UUID of the paying user |
| `amount` | Decimal amount |
| `status` | Payment status string |
| `created_at` | |

---

## Application Routes

| Path | Component | Access |
|---|---|---|
| `/` | `Index` | Public — landing page |
| `/auth` | `Auth` | Public — sign in / sign up |
| `/dashboard` | `Dashboard` | Authenticated — rider & driver views |
| `/admin` | `AdminPanel` | Authenticated — payments table |
| `*` | `NotFound` | 404 fallback |

---

## Key Components

### `RiderView`
Displays a ride-request form (pickup, dropoff, optional fare and notes) and the rider's ride history. Subscribes to Supabase Realtime for live status updates filtered by the current user's `rider_id`.

### `DriverView`
Two-tab interface: **Available Rides** (all `pending` rides) and **My Rides** (rides accepted by this driver). Both lists update in real time via a channel on the `rides` table.

### `RideCard`
Shared card used by both `RiderView` and `DriverView`. Renders ride details and context-appropriate action buttons (accept, start, complete, cancel) based on the `userType` prop and current ride `status`.

### `MapView` *(enhancement)*
A `react-leaflet` `MapContainer` centred on Pune, India. Renders an OpenStreetMap tile layer with a default marker. Intended to be extended with dynamic pickup/dropoff coordinates from the `rides` table.

### `Chat` *(enhancement)*
Real-time chat widget that reads from and writes to the `notifications` table. Subscribes to `INSERT` events so new messages appear instantly for all connected users.

### `PaymentSimulator` *(enhancement)*
Simulates a payment transaction by inserting a record into the `payments` table. Used to demo the payment flow without a real payment gateway.

### `AdminPanel`
Fetches the 50 most recent rows from `payments` and displays them in a tabular layout, accessible at `/admin`.

---

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration files from `supabase/migrations/` in chronological order (filename prefix is the timestamp).
3. The migrations will:
   - Create `user_role` and `ride_status` enums.
   - Create the `profiles`, `rides`, `notifications`, and `payments` tables.
   - Enable Row Level Security on all tables.
   - Add RLS policies for riders and drivers.
   - Register a trigger to auto-create a profile row on user sign-up.
   - Enable Realtime on the `rides` table.
4. Copy the **Project URL** and **anon public key** from **Settings → API** into your `.env`.
