# HU08 — Confirmar o reabrir solución + búsqueda

- Branch: `hu08-confirmar-reabrir` (from `main`)
- TDD: off
- Goal: requester confirms (RESUELTO→CERRADO) or reopens with reason (RESUELTO→EN_PROGRESO); text search on title/description; actions traced.

## Existing support

- Transitions RESUELTO→CERRADO and RESUELTO→EN_PROGRESO already allowed by trigger.
- `audit_action` enum already includes `SOLUTION_CONFIRMED` and `REQUEST_REOPENED` (must insert those explicitly — no trigger covers them).
- Reopen reason: store as a `request_comments` row + audit event.

## Tasks

- [ ] T1 Backend: `POST /requests/:id/confirm` (role 1, only own request, only when RESUELTO) — sets CERRADO, adds audit `SOLUTION_CONFIRMED`, transaction + `app.current_user_id`.
- [ ] T2 Backend: `POST /requests/:id/reopen` (role 1, only own request, only when RESUELTO), body `{reason}` non-empty — sets EN_PROGRESO, inserts comment with reason, audit `REQUEST_REOPENED`, clears closed/resolved dates where valid.
- [ ] T3 Backend: `GET /requests?q=` — extend `GET /requests` for role 1 with optional text search (ILIKE on title/description, parameterized).
- [ ] T4 Frontend portal (solicitante): search box on "mis solicitudes"; confirm/reopen actions (reopen requires reason dialog) on RESUELTO requests.
- [ ] T5 Functional checks: backend boots, eslint clean, frontend build passes.

## Route: delegated writer

Progress / commits:
