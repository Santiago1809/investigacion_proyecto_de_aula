# HU07 — Cambio de estado de solicitud

- Branch: `hu07-cambio-estado` (from `main`)
- TDD: off
- Goal: agent changes request status; only allowed transitions; full history; reject invalid ones.

## Existing support

- `trg_validate_status_transition`: NUEVO→ASIGNADO, ASIGNADO→EN_PROGRESO, EN_PROGRESO→RESUELTO, RESUELTO→CERRADO, RESUELTO→EN_PROGRESO (reopen).
- `request_status_history` + `create_status_history()` function.
- `trg_audit_status_change` (needs `app.current_user_id`), `trg_manage_request_dates`, `trg_status_notifications`.

## Tasks

- [x] T1 Backend: `PATCH /request/:id/status` (AGENTE asignado o COORDINADOR) — matriz validada en JS antes de la BD, transacción con `app.current_user_id`, `create_status_history` antes del update, 409 con mensaje español en transición inválida.
- [x] T2 Backend: `GET /request/:id/history` (roles 2,3,4) — historial completo quién/cuándo/qué.
- [x] T3 Frontend: columna "Acciones" en la tabla del coordinador con transiciones permitidas por estado + timeline de historial colapsable (lazy fetch).
- [x] T4 Checks: eslint backend + boot OK; frontend lint + tsc + build OK.

## Route: mixed

Backend: repository recuperado de stash del writer cancelado (completo y correcto: matriz + transacción); orchestrator completó service/controller/routes inline.
Frontend: 1 writer delegado, verificado.
Nota: las páginas de detalle `/console/requests/[id]` viven en HU06 — RequestStatusCell es reutilizable ahí tras el merge.

Progress / commits:
