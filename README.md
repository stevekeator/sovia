# Visual Routine Platform

This repository contains a focused v1 implementation of a visual routine platform for care organizations.

The workspace contains two apps:

- `apps/web`: Next.js admin portal, marketing site, and internal API
- `apps/mobile`: Expo React Native app for linked supported users

## Stack

- Web: Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth v5 beta
- Mobile: Expo React Native, TypeScript, AsyncStorage, Expo File System
- Local infra: Docker Compose for PostgreSQL

## Quick start

1. Install dependencies from the repo root:

```bash
npm install
```

2. Start Postgres:

```bash
npm run db:up
```

3. Apply schema and seed demo data:

```bash
cd apps/web
npx prisma migrate dev --name init
npm run db:seed
```

4. Run the web app:

```bash
cd apps/web
npm run dev
```

5. Run the mobile app in a separate terminal:

```bash
cd apps/mobile
npm run ios
```

Use `npm run android` for Android emulator.

## Demo credentials

- Org admin: `avery@sunrisecare.test` / `demo-admin-123`
- Caregiver: `jordan@sunrisecare.test` / `demo-caregiver-123`
- Super admin: `super@visualroutine.test` / `super-admin-123`

## How web and mobile talk

- Mobile linking: `POST /api/mobile/link`
- Payload refresh: `GET /api/mobile/payload`
- Session sync: `POST /api/mobile/sessions`
- Health check: `GET /api/mobile/status`

The mobile app stores the device token, payload, cached images, and unsynced session queue locally.

## Verification commands

- Web: `npm run verify:web`
- Mobile: `npm run verify:mobile`

## Notes

- The mobile app defaults to `http://localhost:3000` on iOS simulator and `http://10.0.2.2:3000` on Android emulator.
- Override the mobile API target with `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`.
# sovia
