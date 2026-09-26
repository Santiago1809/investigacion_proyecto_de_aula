# AGENTS.md — investigacion

Course project: `frontend/` (Next.js 16 + React 19, Spanish UI) + `backend/` (Express 5, ESM) + `bd/base_de_datos.sql` (PostgreSQL schema). No root package.json — each app has its own deps and scripts. No tests configured anywhere.

## Commands

- `backend/`: `npm run dev` (`node --watch server.js`, port from `PORT`, default 3000). No build/lint/test scripts — `eslint.config.js` exists, run `npx eslint .` manually.
- `frontend/`: `npm run dev` (port 3000), `npm run build`, `npm run lint`.
- DB: apply `bd/base_de_datos.sql` to a PostgreSQL database before starting the backend; backend exits fast if it can't connect.

## Backend (`backend/`)

- Pure ESM (`"type": "module"`); imports between local files need explicit `.js` extension.
- `server.js` is thin; real wiring is in `src/app.js` → `config/` (`env-vars.js` with zod validation, `database.js` pg Pool), `routes/` → `controllers/` → `services/` → `repositories/` (raw SQL via `pg`). Follow that layering when adding features.
- Env is validated with zod in `src/config/env-vars.js` and **throws at startup** if invalid. Required: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (min 32 chars). `JWT_REFRESH_SECRET` is mandatory in production.
- Auth: JWT (jsonwebtoken, 15m access default), bcrypt, `src/middlewares/auth.middleware.js`.
- Architecture doc (Spanish): `backend/GEX-ANT-04-SCRUM-Sprint-1-FaseDelProyecto-ArquitecturaBackend-*.md`.
- `postinstall` runs `prisma skills sync || exit 0` — there is no Prisma schema; failures are intentionally ignored.

## Frontend (`frontend/`)

- **Next.js 16 with breaking changes from training data.** Read the local guide in `node_modules/next/dist/docs/` before writing Next-specific code (routing, layout conventions, server components). See `frontend/AGENTS.md` — do not delete that block, `next dev` re-adds it.
- next-auth v5 **beta** (`auth.ts`, middleware/edge nuances apply) with Credentials provider hitting the backend `/auth/login`. JWT session strategy; `session.accessToken` is attached by axios interceptor in `lib/api.ts`.
- API base URL: `lib/api.ts` — server side uses `BACKEND_URL`, browser uses `NEXT_PUBLIC_BACKEND_URL`, both default to `http://localhost:3001`. Set both env vars if the backend port differs.
- React Query + Zustand for state; shadcn/CVA + Tailwind v4 (postcss plugin, no tailwind.config file).
- App routes: `login/`, `portal/`, `console/`, `audit/`, `work/`; shared UI in `components/`, types in `lib/interfaces/`, `types/`.

## Domain/database

- Spanish domain: users with roles `SOLICITANTE | AGENTE | COORDINADOR | AUDITOR`; requests with status `NUEVO | ASIGNADO | EN_PROGRESO | RESUELTO | CERRADO` and priority `BAJA | MEDIA | ALTA | CRITICA`. User-facing copy and domain terms stay in Spanish; code identifiers/comments stay in English unless the file already uses Spanish.
- Note: `bd/base_de_datos.sql` has a typo `CREATE CREATE TYPE` — fix before running on a fresh DB.
