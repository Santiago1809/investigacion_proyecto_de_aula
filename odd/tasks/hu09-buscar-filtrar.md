# HU09 — Buscar y filtrar solicitudes

- Branch: `hu09-buscar-filtrar` (from `main`)
- TDD: off (no test runner en el repo)
- Goal: el usuario busca texto (título/descripción) y combina filtros por estado, prioridad y categoría; respeta permisos; la combinación de filtros es consistente.

## Existing support

- `GET /request?q=` (HU08) ya busca con ILIKE en título/descripción, solo para solicitante y sobre sus propias solicitudes.
- Índices: `idx_requests_status`, `idx_requests_priority`, `idx_requests_category`.
- `categories.active` para filtrar categorías vigentes.

## Tasks

- [ ] T1 Backend: extender `GET /request` con `status`, `priority`, `category_id` (zod enums, combinables con `q`), un único WHERE con todos los criterios AND; cada filtro se omite si no viene. Mismo alcance por rol que hoy: solicitante solo propias, agente solo asignadas vigentes, coordinador/auditor todas.
- [ ] T2 Backend: verificar que la respuesta indique qué filtros se aplicaron (`applied_filters`) para que el cliente no adivine.
- [ ] T3 Frontend portal: selects de estado/prioridad/categoría combinables con el buscador existente; limpiar todos los filtros; contador/estado vacío coherente.
- [ ] T4 Frontend consola (coordinador): mismos filtros sobre el listado global.
- [ ] T5 Checks: eslint backend + boot; frontend lint + tsc + build.

## Route: delegated writer (backend, luego frontend)

Notas:
- Reutiliza `useUserRequests` y `useAllRequests`; no crear otro cliente HTTP.
- IDs UUID string; las categorías tienen id numérico SMALLINT.

Progress / commits:
