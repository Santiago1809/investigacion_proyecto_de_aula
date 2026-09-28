# HU11 — Historial de auditoría (solo lectura)

- Branch: `hu11-auditoria` (from `main`)
- TDD: off
- Goal: el auditor consulta el historial para verificar decisiones; solo lectura; actor codificado, fecha, campo y valores anterior/nuevo; acceso restringido.

## Existing support

- `audit_events`: id, request_id, actor_id, action, field_name, old_value, new_value, created_at.
- Triggers ya llenan la tabla: `trg_request_creation_audit`, `trg_audit_priority_change`, `trg_audit_status_change`, `trg_assignment_effects`, `trg_comment_audit`, y los inserts explícitos de HU08 (`SOLUTION_CONFIRMED`, `REQUEST_REOPENED`).
- Índice `idx_audit_created_at`.

## Tasks

- [ ] T1 Backend: `GET /audit` (rol 4 AUDITOR) — listado paginado + filtros `action`, `request_id`, `from`, `to`, `actor_id`; orden `created_at desc, id desc`. Actor **codificado** (id) y nombre resuelto para lectura, nunca credenciales.
- [ ] T2 Backend: `GET /audit/:id` (rol 4) — detalle de un evento. Sin endpoint de escritura: la auditoría es inmutable.
- [ ] T3 Frontend sección `app/audit/`: tabla con filtros (acción, rango de fechas, solicitud), detalle por evento, todo de solo lectura. Explicar en la UI que el registro es inmutable.
- [ ] T4 Checks: eslint backend + boot; frontend lint + tsc + build.

## Route: delegated writer (backend, luego frontend)

Notas:
- La app ya monta `/audit` como ruta de frontend: es la sección natural para esta HU.
- No exponer `password_hash` ni datos de credenciales en ninguna respuesta.

Progress / commits:
