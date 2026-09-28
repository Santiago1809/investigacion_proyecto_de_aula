# HU10 — Indicadores agregados del servicio

- Branch: `hu10-indicadores` (from `main`)
- TDD: off
- Goal: el coordinador consulta volumen por estado y tiempo mediano de ciclo; filtros reproducibles (estado, prioridad, categoría); sin ranking individual.

## Existing support

- `requests.status/priority/category_id`, `created_at`, `resolved_at`, `closed_at` — el ciclo se mide de `created_at` a `resolved_at` (o `closed_at` si está cerrada).
- `audit_events` ya registra: REQUEST_CREATED, PRIORITY_CHANGED, ASSIGNED, UNASSIGNED, STATUS_CHANGED, COMMENT_CREATED, SOLUTION_CONFIRMED, REQUEST_REOPENED.

## Tasks

- [ ] T1 Backend: `GET /metrics/summary` (rol 3 COORDINADOR) — mismo query params de filtro que HU09 (`status`, `priority`, `category_id`, `q`) para que el resultado sea reproducible. Respuesta: `{volumen_por_estado: [{status, total}], ciclo: {mediana_horas, resueltas, muestra}}`.
- [ ] T2 Backend: mediana calculada con `percentile_cont(0.5)` sobre el ciclo en horas, solo solicitudes resueltas/cerradas con `resolved_at` no nulo; devolver `null` si no hay muestra (no 0).
- [ ] T3 Backend: **prohibido ranking individual** — la respuesta no incluye usuarios ni agentes; agregación por estado únicamente. La capa de servicio lo deja explícito en un comentario.
- [ ] T4 Frontend consola: tarjetas de indicadores (volumen por estado + mediana de ciclo) con los mismos filtros de HU09, y botón "aplicar" que muestra los filtros usados.
- [ ] T5 Checks: eslint backend + boot; frontend lint + tsc + build.

## Route: delegated writer (backend, luego frontend)

Notas:
- `percentile_cont` es de PostgreSQL; no requiere extensión.
- `interpolated = median` sobre `extract(epoch from (resolved_at - created_at))/3600`.

Progress / commits:
