# HU09 — Buscar y filtrar solicitudes

- Branch: `hu09-buscar-filtrar` (from `main`)
- TDD: off (no test runner en el repo)
- Goal: el usuario busca texto (título/descripción) y combina filtros por estado, prioridad y categoría; respeta permisos; la combinación de filtros es consistente.

## Existing support

- `GET /request?q=` (HU08) ya busca con ILIKE en título/descripción, solo para solicitante y sobre sus propias solicitudes.
- Índices: `idx_requests_status`, `idx_requests_priority`, `idx_requests_category`.
- `categories.active` para filtrar categorías vigentes.

## Tasks

- [x] T1 Backend: `GET /request` y `GET /request/all` aceptan `q`, `status`, `priority`, `category_id` combinables en un único WHERE con AND; cada filtro se omite si no viene. Alcance por rol intacto.
- [x] T2 Backend: ambas respuestas incluyen `applied_filters` con solo los filtros aplicados; `status`/`data`/`pagination` sin cambios.
- [x] T3 Frontend portal: `FilterToolbar` compartida (texto + estado + prioridad + categoría) sobre "mis solicitudes", "Limpiar" y estado vacío coherente.
- [x] T4 Frontend consola: mismos filtros sobre el listado global, ordenamiento y paginación intactos.
- [x] T5 Checks: eslint backend + boot OK; frontend lint + tsc + build OK.

## Route: delegated writer (backend, luego frontend)

Notas:
- Enviar `value || undefined`: un string vacío en `category_id` dispara 400 (`z.coerce.number('')` → 0 → no positiva). axios descarta los `undefined`.
- `status`/`priority` se comparan sin cast (`r.status = $n`); castear a `text` rompe el enum de Postgres.
- Los filtros van en la query key de React Query; `applied_filters` del backend alimenta el resumen "Filtros: …".
- Pendiente conocido (preexistente, fuera de alcance): el rol AGENTE no tiene listado propio — `/request` siempre filtra por `requester_id` y `app/work/` sigue stub.

Progress / commits:
