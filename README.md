# Shri Balaji Ledger

Admin-only customer, loan, and payment management for Shri Balaji Enterprises.

## Stack

- React 19 with TanStack Router and TanStack Start
- Vite and Tailwind CSS
- Supabase-backed authentication and data access
- JavaScript and Zod validation

## Development

Create a `.env` file from the app configuration you use in your deployment environment. At minimum, keep the Supabase and runtime secrets local to the machine you are developing on:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-long-random-secret
```

Install dependencies and start the local app:

```sh
npm install
npm run dev
```

Useful commands:

```sh
npm run build
npm run lint
npm start
```

The production build is generated into `frontend/.output` and is served by the TanStack Start runtime.

## Project Structure

- `frontend/src/routes` contains the file-based application routes and page logic.
- `frontend/src/components` contains reusable application and UI components.
- `frontend/src/lib` contains schema, formatting, receipt, and helper logic.
- `frontend/src/integrations` contains provider integrations such as Supabase auth and storage wrappers.
- `supabase/migrations` contains the database migration history for project data changes.

## Architecture Notes

This project follows a single app architecture inside `frontend/` rather than mixing a backend directory with the frontend app. The route tree, UI layer, and integration layer are kept together under the same application root to reduce drift, duplication, and stale code paths.
