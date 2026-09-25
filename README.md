# Shri Balaji Ledger

Shri Balaji Ledger is an admin-only web application for managing customers, loans, payments, receipts, and account settings for Shri Balaji Enterprises.

## Features

- Supabase authentication with protected application routes.
- Customer records with create, edit, detail, and payment history views.
- Payment recording with validation and downloadable receipts.
- Dashboard summaries for customer, loan, and payment activity.
- Responsive interface for desktop and mobile use.
- Supabase migrations, row-level security, storage policies, and security logging.

## Technology

- React 19, TanStack Router, and TanStack Start
- Vite, Nitro, and Tailwind CSS
- Supabase authentication, database, and storage
- JavaScript with Zod validation
- npm for dependency management

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project with access to its URL and API keys

## Local Development

1. Install dependencies:

	```sh
	npm install
	```

2. Copy `.env.example` to `.env` and fill in the values from your Supabase project. Never commit `.env` or expose the service-role key to browser code.

3. Apply the database migrations using the Supabase CLI or the Supabase dashboard:

	```sh
	npx supabase db push
	```

4. Start the development server:

	```
	npm run dev
	```

The local app is served by Vite, normally at `http://localhost:5173`.

## Environment Variables

The browser client uses the `VITE_` variables. Server-side routes use the non-prefixed variables so private credentials are not bundled into client code.

| Variable | Used by | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase publishable/anon key |
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Publishable key used by auth middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Private key for trusted admin operations |

`SUPABASE_SERVICE_ROLE_KEY` must only be configured in the server environment. It bypasses row-level security and must never be sent to the client.

## Commands

```sh
npm run dev       # Start the Vite development server
npm run lint      # Run ESLint
npm run build     # Create the production Nitro bundle
npm start         # Serve frontend/.output/server/index.mjs
npm run preview   # Preview the Vite production output
npm run format    # Format frontend source files
```

The production build is generated in `frontend/.output`. Run `npm run build` before `npm start`.

## Database

Migration files live in `supabase/migrations`. Apply them to a linked project with `npx supabase db push`. The application expects the migration set to be applied before using customer or payment workflows.

## Project Structure

- `frontend/src/routes` contains file-based routes and page logic.
- `frontend/src/components` contains reusable application and UI components.
- `frontend/src/lib` contains schemas, formatting, receipt generation, and helpers.
- `frontend/src/integrations` contains Supabase clients and authentication integration.
- `frontend/src/services` contains customer, payment, dashboard, and auth service logic.
- `supabase/migrations` contains the database schema and security migration history.

## Deployment Checklist

- Configure all required environment variables in the server and build environments.
- Apply all Supabase migrations.
- Confirm the production URL is allowed by Supabase authentication settings.
- Verify that the service-role key is available only to server-side runtime code.
- Run `npm run lint` and `npm run build` before deployment.

## Known Follow-up

The sidebar currently uses the built-in brand mark. Replacing it with a user-provided logo image remains pending until the image asset is supplied; see `roadmap.md`.
