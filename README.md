# IGNOU Coders

IGNOU Coders is a community-focused learning platform for IGNOU students who want to build practical coding skills through recorded lessons, study resources, live support, and a welcoming student community.

This project is built with Next.js and integrates with Supabase for authentication and secure session management.

## Features

- Modern landing page for the IGNOU Coders community
- Student sign-in and sign-up flows
- Google OAuth support via Supabase
- Protected dashboard area for authenticated users
- Searchable student class dashboard with video lessons and study notes
- Admin content studio for publishing and managing classes, PDFs, and cover images
- Supabase database and private Storage persistence for published class content
- Admin login flow with passcode + session secret
- Responsive, mobile-friendly UI built with Next.js and Tailwind CSS

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React icons

## Project Structure

```text
.
├── app/
│   ├── admin/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── public/
├── supabase/
│   └── migrations/
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 20 or later
- npm
- A Supabase project
- An admin passcode and session secret for the admin login flow

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment template:

```bash
copy .env.example .env.local
```

4. Fill in the required values in `.env.local`:

```env
ADMIN_PASSCODE=your-admin-passcode
ADMIN_SESSION_SECRET=your-long-random-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> The app also accepts lowercase aliases for admin environment variables if your deployment already uses them.
> Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it through a `NEXT_PUBLIC_` variable.

## Class Content Storage

Class details are stored in the Supabase `public.classes` table. Uploaded PDF notes and cover images are stored in the private `class-assets` Storage bucket; signed-in students receive time-limited signed links. The bucket is created by the database migration.

Apply the SQL migrations in `supabase/migrations` to your Supabase project before publishing classes. For a new project, run the migration files in filename order in the Supabase SQL Editor (or apply them with the Supabase CLI). The classes table grants read access only to authenticated users; admin writes use the server-side service role key after the admin session is verified. Uploaded files live in a private bucket and are served to signed-in students using time-limited signed links.

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and your deployment environment so the protected admin API can save classes and manage uploaded files. When the admin panel is opened after setup, it copies that browser's existing locally saved classes and uploaded files into Supabase. Keep that browser's local data available until migration completes; the local copy is removed only after all legacy classes have migrated successfully.

The admin content studio includes published-class search and content counts. Students can search classes by title or notes from the dashboard.

## Running the App

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Build

Build the app:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Environment Notes

This project relies on Supabase for login and session flows. Configure the Supabase project before trying to sign in or use authenticated routes.

The admin authentication route uses `ADMIN_PASSCODE` and `ADMIN_SESSION_SECRET` for server-side verification.

## Deployment

The app is ready to be deployed on platforms like Vercel or any Node.js-compatible hosting environment.

For production deployment, set the environment variables from `.env.example` in your hosting provider. In particular, configure `SUPABASE_SERVICE_ROLE_KEY` as a server-only secret (never prefix it with `NEXT_PUBLIC_`) and keep the admin passcode and session secret secure. Apply the Supabase migrations before deploying class content features.

## Contributing

Contributions are welcome. If you want to improve the platform, add features, or fix bugs, open a pull request with a clear description of the changes.

## License

This project is currently unlicensed unless otherwise specified by the repository owner.
