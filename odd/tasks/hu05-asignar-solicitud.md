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

- [ ] T1 Backend: `POST /requests/:id/assign` (role 3 COORDINADOR), body `{agent_id}` — insert assignment + set status ASIGNADO + set `app.current_user_id` in transaction; map DB violations to 409/400 with Spanish message.
- [ ] T2 Backend: `GET /users/agents` (role 3) — list ACTIVE users with AGENTE role.
- [ ] T3 Backend: `GET /requests/:id` (roles 1,2,3,4) — request detail incl. current assignment.
- [ ] T4 Backend: `GET /notifications` (authenticated) — list notifications for current user, unread first.
- [ ] T5 Frontend console (coordinator): assign UI on request list/detail — pick agent from `GET /users/agents`, call assign, show errors.
- [ ] T6 Frontend: notifications bell/list visible after login (reads `GET /notifications`).
- [ ] T7 Functional checks: backend boots (`npm run dev` no crash), `npx eslint .` clean, `npm run build` in frontend passes.

## Route: delegated writer

Progress / commits:
