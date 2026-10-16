# IGNOU Coders (pyeater.in)

IGNOU Coders is a dedicated full-stack learning platform designed for IGNOU students (BCA / MCA / CS) to master practical programming skills, access recorded concept lectures, attend live doubt-clearing sessions, and download study notes.

Deployed with Next.js (App Router), Supabase for database & authentication, and Vercel Analytics.

---

## 🚀 Key Features

### 🎓 Student Experience (`/dashboard`)
- **Recorded Sessions View**: Interactive catalog of curriculum chapters and modules with video playback and instant PDF study material downloads.
- **Live Sessions View (Google Meet)**: Dedicated tab displaying live classes scheduled by the admin with instant join links.
- **Smart Notification Bell**: Real-time indicator alerting students whenever a new live session or doubt class is announced.
- **Focused Video Player**: In-depth modal with embedded YouTube player, lesson description, and quick-download notes button.
- **Client-Side Session Store**: Persistent student state and seamless authentication via Supabase Auth (Email / Password & Google OAuth).

### 🛠️ Admin Panel Studio (`/admin`)
- **Secure Access Control**: Separate, secure admin URL with passcode and server-verified session cookie.
- **Recorded Content Manager**: Publish, edit (with pencil action button), and delete chapters, topics, YouTube video URLs, cover thumbnails, and PDF attachments.
- **Live Class Manager**: Schedule, edit (with pencil action button), and delete live Google Meet sessions with custom topics, timings, and thumbnail posters.
- **Automatic Supabase Sync**: Real-time server-side persistence using the Supabase Service Role key with automatic offline fallback.

### ⚡ Performance & Analytics
- **Next.js 16 + React 19** with Tailwind CSS v4 styling.
- **Vercel Web Analytics** integrated via `@vercel/analytics/next`.
- **Zero Dummy Data**: Clean initial state where only admin-published content appears.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr` & `@supabase/supabase-js`)
- **Analytics**: [@vercel/analytics](https://vercel.com/analytics)
- **Language**: TypeScript

---

## 📂 Project Structure

```text
.
├── app/
│   ├── admin/                 # Admin Studio & Passcode authentication
│   ├── api/
│   │   ├── admin/             # Admin session validation & action APIs
│   │   ├── classes/           # Recorded classes CRUD endpoints
│   │   └── live-sessions/     # Live Google Meet sessions CRUD endpoints
│   ├── auth/                  # Supabase Auth callback & login flows
│   ├── dashboard/             # Student dashboard (Recorded + Live tabs)
│   ├── globals.css            # Tailwind CSS styling
│   ├── layout.tsx             # Root Layout with SessionProvider & Vercel Analytics
│   └── page.tsx               # Landing page with curriculum overview & CTA
├── components/
│   ├── auth-modal.tsx         # Sign-in & Sign-up modal with Google OAuth
│   ├── student-dashboard.tsx  # Main student portal with sidebar, notification bell & player
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── classes.ts             # Recorded classes types and helpers
│   ├── live-sessions.ts       # Live sessions schema & client helpers
│   ├── session-store.tsx      # Global React context for student auth
│   └── supabase/              # Supabase browser and server clients
├── supabase/
│   └── migrations/            # SQL migration files for tables & storage
│       ├── 20261010000000_user_profiles.sql
│       ├── 20261010010000_classes_and_assets.sql
│       └── 20261011000000_live_sessions.sql
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory (based on `.env.example`):

```env
# Admin Panel Security
ADMIN_PASSCODE=your_secure_admin_passcode
ADMIN_SESSION_SECRET=your_long_random_session_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-service-role-key
```

> ⚠️ **Important**: `SUPABASE_SERVICE_ROLE_KEY` must remain strictly server-side. Never expose it to the browser.

---

## 🗄️ Database Setup (Supabase)

Run the SQL migration scripts in the Supabase SQL Editor in chronological order:

1. `supabase/migrations/20261010000000_user_profiles.sql` — Student profiles table & auth trigger.
2. `supabase/migrations/20261010010000_classes_and_assets.sql` — Recorded classes table and `class-assets` storage bucket with row level security.
3. `supabase/migrations/20261011000000_live_sessions.sql` — Live sessions table with Google Meet link schema and public read access.

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the local dev server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Configure all environment variables from `.env.local` in project settings.
3. If assigning a custom domain like `pyeater.in`:
   - Add your domain in **Vercel Settings -> Domains**.
   - Set the Supabase Redirect URL in **Authentication -> URL Configuration** to include `https://pyeater.in/auth/callback`.
4. Deploy with `npm run build`. Vercel Web Analytics will automatically activate.

---

## 📄 License & Intellectual Property

Copyright © 2026 Sourav Maurya. All rights reserved. The tech infrastructure, database designs, and custom UI components are the exclusive proprietary property of the Lead Developer. No unauthorized distribution or locking is permitted.
