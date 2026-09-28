# HU12 — Exportar reporte CSV

- Branch: `hu12-exportar-reporte` (from `main`)
- TDD: off
- Goal: el coordinador exporta un CSV con los filtros aplicados; excluye credenciales y texto no necesario; la exportación queda registrada.

## Existing support

- `report_exports`: id, requested_by, filters JSONB, created_at.
- `trg_report_export_audit` inserta `REPORT_EXPORTED` en `audit_events` con los filtros serializados.

## Tasks

- [ ] T1 Backend: `GET /reports/requests.csv` (rol 3 COORDINADOR) — mismos filtros que HU09/HU10; devuelve CSV como archivo (`text/csv; charset=utf-8`, `Content-Disposition: attachment`).
- [ ] T2 Backend: columnas mínimas — id, título, categoría, estado, prioridad, solicitante (nombre), agente asignado (nombre), fechas clave. **Sin** contraseñas, hashes, tokens, emails ni texto de descripción.
- [ ] T3 Backend: registrar la exportación con `insert into report_exports (requested_by, filters) values (...)` (el trigger audita) antes de responder; si el insert falla, no se entrega el CSV.
- [ ] T4 Frontend consola: botón "Exportar CSV" que reutiliza los filtros activos; mensaje de éxito con la cantidad de filas; errores en español.
- [ ] T5 Checks: eslint backend + boot; frontend lint + tsc + build.

## Route: delegated writer (backend, luego frontend)

Notas:
- Escapar comas, comillas y saltos de línea al serializar CSV; prefijar valores que empiecen con `=`, `+`, `-`, `@` para evitar inyección de fórmulas en hojas de cálculo.
- El CSV se genera en memoria (el conjunto de datos es de un proyecto de aula); no hace falta streaming.

Progress / commits:
