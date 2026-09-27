# HU07 — Cambio de estado de solicitud

- Branch: `hu07-cambio-estado` (from `main`)
- TDD: off
- Goal: agent changes request status; only allowed transitions; full history; reject invalid ones.

## Existing support

- `trg_validate_status_transition`: NUEVO→ASIGNADO, ASIGNADO→EN_PROGRESO, EN_PROGRESO→RESUELTO, RESUELTO→CERRADO, RESUELTO→EN_PROGRESO (reopen).
- `request_status_history` + `create_status_history()` function.
- `trg_audit_status_change` (needs `app.current_user_id`), `trg_manage_request_dates`, `trg_status_notifications`.

## Tasks

- [ ] T1 Backend: `PATCH /requests/:id/status` (role 2 AGENTE — assigned agent only; role 3 optional) — service validates transition against matrix before DB, writes history row via `create_status_history`, sets resolved/closed dates via triggers, transaction + `app.current_user_id`; map invalid transition to 409 with Spanish message.
- [ ] T2 Backend: `GET /requests/:id/history` (roles 2,3,4) — full status history with who/when.
- [ ] T3 Frontend console: status-change action on assigned requests (allowed options only per current status) + history timeline view.
- [ ] T4 Functional checks: backend boots, eslint clean, frontend build passes.

## Route: delegated writer

Progress / commits:
