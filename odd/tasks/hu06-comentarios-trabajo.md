# HU06 — Comentarios de trabajo

- Branch: `hu06-comentarios-trabajo` (from `main`)
- TDD: off (no test runner configured in repo)
- Goal: agent logs non-empty work comments; author/date immutable; visible to authorized roles; comment not editable once created.

## Existing support (bd/base_de_datos.sql)

- `request_comments` table + `chk_comment_not_empty`.
- `trg_prevent_comment_update/delete`: DB enforces immutability.
- `trg_comment_audit`: audit on insert.

## Tasks

- [ ] T1 Backend: `POST /requests/:id/comments` (roles 2,3; body `{content}` non-empty trim) — author = req.user.id, created_at from DB.
- [ ] T2 Backend: `GET /requests/:id/comments` — visibility by role: SOLICITANTE only own requests, AGENTE only assigned requests, COORDINADOR/AUDITOR all.
- [ ] T3 Frontend: comments section on request detail (agent/coordinator/console + solicitante/portal): list + add form for roles 2,3.
- [ ] T4 Functional checks: backend boots, eslint clean, frontend build passes.

## Route: delegated writer

Progress / commits:
