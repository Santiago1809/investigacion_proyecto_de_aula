# HU05 — Asignar solicitud a agente

- Branch: `hu05-asignar-solicitud` (from `main`)
- TDD: off (no test runner configured in repo)
- Delivery: single branch/PR per HU
- Goal: coordinator assigns a request to an ACTIVE agent with AGENTE role; records who/when; in-app notification; rejects invalid assignment.

## Existing support (bd/base_de_datos.sql)

- `trg_validate_assignment`: agent ACTIVE + role AGENTE + assigned_by COORDINADOR enforced in DB.
- `uq_active_request_assignment`: one active assignment per request.
- `trg_assignment_effects`: audit + notification on insert.
- `trg_validate_status_transition`: NUEVO→ASIGNADO allowed (service must set status).

## Tasks

- [x] T1 Backend: `POST /request/:id/assign` (role 3 COORDINADOR), body `{agent_id}` — insert assignment + set status ASIGNADO + `app.current_user_id` in transaction; trigger violations mapped (23505→409, 23503→404, trigger texts→400).
- [x] T2 Backend: `GET /users/agents` (role 3) — ACTIVE users with AGENTE role.
- [x] T3 Backend: `GET /request/:id` (roles 1,2,3,4) — detail incl. current assignment.
- [x] T4 Backend: `GET /notifications` (authenticated) — unread first, paginated.
- [x] T5 Frontend console (coordinator): assign select + button per NUEVO row in `coordinator-requests-table`; 400/409 messages shown inline.
- [x] T6 Frontend: header bell uses real `GET /notifications` (badge = unread, 60s polling).
- [x] T7 Checks: backend `npx eslint .` clean, `node -e import('./src/app.js')` OK; frontend `npm run lint` + `npm run build` pass.

## Route: mixed

Backend written inline by orchestrator (delegated writer returned empty result twice — runtime issue, not task).
Frontend via delegated writer (1 writer, verified lint+build).
Note: mount points are `/request` and `/users/agents` (existing app.js conventions, singular).
Pending decision: no mark-as-read endpoint (T6 only displays read_at state).

Progress / commits:
