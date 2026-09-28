# HU08 — Confirmar o reabrir solución + búsqueda

- Branch: `hu08-confirmar-reabrir` (from `main`)
- TDD: off
- Goal: requester confirms (RESUELTO→CERRADO) or reopens with reason (RESUELTO→EN_PROGRESO); text search on title/description; actions traced.

## Existing support

- Transitions RESUELTO→CERRADO and RESUELTO→EN_PROGRESO already allowed by trigger.
- `audit_action` enum already includes `SOLUTION_CONFIRMED` and `REQUEST_REOPENED` (must insert those explicitly — no trigger covers them).
- Reopen reason: store as a `request_comments` row + audit event.

## Tasks

- [x] T1 Backend: `POST /request/:id/confirm` (role 1, propia, solo RESUELTO) — transacción con lock, set_config, update a CERRADO + audit explícito `SOLUTION_CONFIRMED`; 403/409 con mensajes en español.
- [x] T2 Backend: `POST /request/:id/reopen` (role 1, propia, solo RESUELTO), `{reason}` obligatorio — EN_PROGRESO + comentario con el motivo + audit `REQUEST_REOPENED`.
- [x] T3 Backend: `GET /request?q=` — búsqueda ILIKE parametrizada en título/descripción para el solicitante; sin `q` el comportamiento no cambia.
- [x] T4 Frontend portal: buscador en "mis solicitudes" (reset a página 1, "Limpiar"), acciones Confirmar/Reabrir solo en RESUELTO, reapertura con textarea inline (motivo obligatorio), errores por fila.
- [x] T5 Checks: eslint backend + boot OK; frontend lint + tsc + build OK.

## Route: delegated writer (2 writers: backend, luego frontend)

Notas:
- `resolved_at` persiste al reabrir; `closed_at` nunca se había seteado (la solicitud no estaba CERRADA).
- No hay componente dialog en `components/ui/` (base @base-ui/react): la reapertura usa textarea inline.
- Auditoría explícita porque ningún trigger cubre SOLUTION_CONFIRMED / REQUEST_REOPENED.

Progress / commits:
