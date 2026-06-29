# Placement CRM

A production-focused placement and recruiting CRM built with Next.js App Router, TypeScript, Prisma, SQLite, Tailwind CSS, and shadcn/ui.

This repository is optimized for a small team running on a single office PC with minimal operational overhead.

## What This Project Includes

- Username/password authentication with SQLite sessions
- Protected dashboard routes
- Company, HR, vacancy, email, search, reminder, and import modules
- Dashboard cards backed by live Prisma queries
- Global search with grouped results
- Dark mode and responsive layouts
- Toast notifications, loading states, and error pages
- Prisma seed data for instant local setup

## Requirements

- Node.js 20 or newer
- npm
- SQLite is bundled through Prisma and does not need a separate server

## Installation

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The default seed creates:

- `admin`
- Password: `admin123`

## Environment Variables

Create a `.env` file from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
AUTH_COOKIE_NAME="placement_crm_session"
```

## Development Workflow

- `npm run dev` starts the app locally.
- `npx prisma studio` opens the database browser.
- `npx prisma migrate dev` creates and applies schema changes.
- `npx prisma db seed` reloads sample data.

## Production Deployment on a Single Office PC

### Recommended Setup

1. Install Node.js LTS on the office PC.
2. Copy the repository to the machine.
3. Run `npm install`.
4. Run `npx prisma migrate dev` once to create the SQLite database.
5. Run `npx prisma db seed` to load the initial records.
6. Run `npm run build`.
7. Start the app with `npm run start`.

### Operational Notes

- Keep the SQLite database file in the project directory.
- Store backups on a separate drive or a synced folder.
- Use a Windows startup task or service wrapper if the app should start automatically after reboot.
- Avoid running multiple write-heavy app instances against the same SQLite file.

## Backup Strategy

SQLite is simple to back up, which is one of its biggest strengths for a single-PC deployment.

### What to Back Up

- `prisma/dev.db`
- `prisma/dev.db-wal` if present
- `prisma/dev.db-shm` if present
- `.env`
- The repository source code

### Suggested Backup Routine

- Daily copy of the database file after office hours
- Weekly full folder backup to an external drive
- Monthly offline archive for disaster recovery

### Safe Backup Tip

Stop the app before copying the database if you want the most conservative backup process.

## Folder Documentation

### `app/`

Next.js App Router pages, layouts, loading states, and error boundaries.

### `components/`

Reusable UI, shell, module tables/forms, dashboard widgets, and shared providers.

### `lib/`

Business logic, Prisma query helpers, validation, auth utilities, reminder engine, email helpers, and import logic.

### `prisma/`

Prisma schema, migrations, and seed script.

### `docs/`

Architecture notes and database design documentation.

## Database Design

See [docs/database-design.md](docs/database-design.md) for the Prisma entity map, ER diagram, and table rationale.

## Testing Checklist

- `npx prisma migrate dev` completes successfully
- `npx prisma db seed` populates the sample CRM data
- `npm run dev` starts without console errors
- Login works with `admin` / `admin123`
- Dashboard counts and lists load from SQLite
- Company, HR, vacancy, search, email, and reminder pages render correctly
- Dark mode toggles correctly
- Keyboard focus works for global search using `/` or `Ctrl/Cmd + K`

## Maintenance Notes

- Keep Prisma schema changes small and migration-friendly.
- Prefer soft delete for business records so history remains available.
- Re-run the seed only when you want to refresh demo data.
- Keep the office deployment to a single writer instance for SQLite safety.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```
