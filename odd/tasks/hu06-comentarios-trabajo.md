# HU06 — Comentarios de trabajo

- Branch: `hu06-comentarios-trabajo` (from `main`)
- TDD: off (no test runner configured in repo)
- Goal: agent logs non-empty work comments; author/date immutable; visible to authorized roles; comment not editable once created.

## Existing support (bd/base_de_datos.sql)

- `request_comments` table + `chk_comment_not_empty`.
- `trg_prevent_comment_update/delete`: DB enforces immutability.
- `trg_comment_audit`: audit on insert.

## Tasks

- [x] T1 Backend: `POST /request/:id/comments` (roles 2,3) — zod trim min 1, author = req.user.id, 23503→404, 201 con el comentario.
- [x] T2 Backend: `GET /request/:id/comments` — visibilidad por rol en una query (SOLICITANTE propias, AGENTE asignadas activas, COORDINADOR/AUDITOR todas); 404 sin filtrar existencia.
- [x] T3 Frontend: `CommentsSection` compartida en `/console/requests/[id]` y `/portal/requests/[id]`; títulos de ambas tablas linkean al detalle. Form solo para roles 2/3.
- [x] T4 Checks: backend eslint + boot OK; frontend lint + tsc + build OK.

## Route: delegated writer (2 writers: backend, luego frontend)

Notas:
- `GET /request/:id` vive en la rama HU05 (sin mergear acá): las páginas de detalle muestran UUID + comentarios, sin header de título/estado hasta el merge.
- Idempotencia/inmutabilidad la garantizan triggers de BD (no edit/delete UI).
- IDs son UUID strings end-to-end.

Progress / commits:
