# Web Application

This is the Next.js application for the Visual Routine Platform.

It includes:

- public marketing pages
- admin authentication
- organization-scoped portal
- Prisma models and demo seed data
- internal API routes used by the mobile app

## Environment

Copy `.env.example` to `.env` if needed.

Required variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `APP_URL`

The repository already includes a local `.env` configured for Docker Postgres at `localhost:5432`.

## Local setup

1. Start Postgres from the repo root:

```bash
docker compose up -d
```

2. Apply migrations:

```bash
npx prisma migrate dev --name init
```

3. Seed demo data:

```bash
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

## Demo credentials

- Org admin: `avery@sunrisecare.test` / `demo-admin-123`
- Caregiver: `jordan@sunrisecare.test` / `demo-caregiver-123`
- Super admin: `super@visualroutine.test` / `super-admin-123`

## Key routes

- `/`: marketing site
- `/login`: admin sign-in
- `/portal`: dashboard
- `/portal/users`: supported user management
- `/portal/routines`: routine library and editor
- `/portal/assignments`: routine assignment management
- `/portal/reports`: completion reporting
- `/portal/settings`: admin roster and billing status

## Mobile API routes

- `POST /api/mobile/link`
- `GET /api/mobile/payload`
- `POST /api/mobile/sessions`
- `GET /api/mobile/status`

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## Known limitations

- External public-domain image search is not implemented; the schema supports the source type for future work.
- Billing status is surfaced and editable for super admins, but access suspension rules are intentionally light in this v1.
- Reporting is list/table based and does not include advanced analytics.
