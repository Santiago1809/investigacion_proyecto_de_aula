# Funcionalidades del agente — Mesa de trabajo

- Branch: `work-solicitudes-agente` (from `main`)
- TDD: off (mismo criterio del proyecto; el único check ejecutable es el del CSV)
- Objetivo: el rol AGENTE (2) tiene una mesa de trabajo real — sus solicitudes asignadas, con cambio de estado y comentarios — en lugar de una página stub.

## Existing support (ya mergeado)

- `PATCH /request/:id/status` acepta rol 2 siempre que sea el agente con asignación vigente.
- `GET/POST /request/:id/comments` aceptan rol 2 con visibilidad por asignación vigente.
- Frontend listo para reusar: `RequestStatusCell` (HU07), `CommentsSection` (HU06), `FilterToolbar` (HU09), `apiErrorMessage`.
- Sidebar ya expone "Mesa de trabajo" → `/work` solo para rol 2.
- Filtros combinables ya definidos en `request.repository.js` (`q`, `status`, `priority`, `category_id` + `applied_filters`).

## Gap real

`GET /request` filtra siempre por `requester_id`, así que el agente no tiene ninguna forma de listar lo que tiene asignado. `app/work/page.tsx` es un stub.

## Tasks

- [ ] T1 Backend: `GET /request/assigned` (rol 2) — solicitudes con asignación vigente al usuario actual, mismos filtros y paginación que `GET /request/all`, con `applied_filters`.
- [ ] T2 Backend: dejar explícito en el servicio que la asignación vigente es `unassigned_at IS NULL` y que no se expone información de otras asignaciones.
- [ ] T3 Frontend: `/work` real — tabla de solicitudes asignadas con la `FilterToolbar` de HU09, `RequestStatusCell` para cambiar estado y enlace al detalle.
- [ ] T4 Frontend: permitir al rol 2 entrar al detalle con comentarios y cambio de estado (hoy esa pantalla es de la consola del coordinador).
- [ ] T5 Checks: eslint backend + boot; frontend lint + tsc + build.

## Route: 2 writers en paralelo (backend y frontend, archivos separados)

Notas:
- No tocar `request.route.js` sin cuidado: el orden de rutas importa (`/assigned` antes que `/:id`).
- IDs UUID string en el frontend; `category_id` es número.
- `q` con ILIKE no escapa `%`/`_` (pendiente conocido, no se cambia acá).

Progress / commits:
