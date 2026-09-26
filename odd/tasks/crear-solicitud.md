# Feature: Crear solicitud (rol SOLICITANTE) en /portal

**Objective**: un usuario con rol SOLICITANTE (id 1) puede crear una solicitud (título, descripción, categoría, prioridad) desde `/portal` y verla aparecer en "Mis solicitudes".

**Scope authorized**: backend POST /request + GET /categories; frontend formulario en /portal. Nada más.

**TDD**: desactivado (el proyecto no tiene tests configurados). Checks: `npx eslint .` (backend), `npm run lint && npm run build` (frontend).

**Route per task**: writer delegado (trigger: 2+ archivos no triviales, backend + frontend).

## Estado encontrado (verificado)

- Backend: `createRequestController` vacío y `createRequestSchema` vacío en `request.controller.js`; ruta POST no registrada en `request.route.js`.
- **Bug** en `request.repository.js` (`createUserRequest`): `VALUES ($1,$2,$3,$3,$5)` — duplica `$3` y salta `$4`; debe ser `($1,$2,$3,$4,$5)`.
- Prioridades válidas (enum DB): `BAJA | MEDIA | ALTA | CRITICA`, default `MEDIA`. Status default `NUEVO`. `requests.status`/`priority` son enums PG, insertarlos como texto.
- Rol SOLICITANTE = id 1 (`auth.middleware.js` doc comment).
- No existe endpoint de categorías: el formulario necesita `GET /categories` (id, name, active).
- Frontend: `frontend/components/ui/` tiene `field.tsx`, `input.tsx`, `sheet.tsx`, `button.tsx`. NO hay `select`/`textarea`/`dialog` primitivos. Sheet usa `@base-ui/react/dialog`.
- Mutaciones existentes en `hooks/use-requests.ts` (updateRequest, addComment, updateRequestStatus) — seguir ese patrón.
- No crear archivos nuevos salvo los listados abajo.

## Tasks

- [x] T1 (backend): arreglar `VALUES` en `createUserRequest`; implementar `createRequestSchema` (title 1-200 trim non-empty, description trim non-empty, category_id int positive, priority enum con default MEDIA — `strict()` y mensajes en español); implementar `createRequestController` (400 con flatten + message de service; 201 con request); registrar `POST /` con `authenticateToken, authorizeRoles(1)` en `request.route.js`. Service: devolver `201` con la fila creada (ajustar `createRequest` — hoy devuelve array entero, debe devolver `{ status: 201, request: rows[0] }` o equivalente consistente con `getRequestsByUser`).
- [x] T2 (backend): `GET /categories` — `category.route.js`, `category.controller.js`, `category.service.js` (o repositorio directo si el service sería vacío), `category.repository.js`. Solo activas (`WHERE active = TRUE ORDER BY name`). Auth: `authenticateToken` (cualquier rol logueado, el formulario lo necesita). Montar en `app.js`.
- [x] T3 (frontend): hooks — `useCategories()` en `hooks/use-categories.ts` (queryKey `["categories"]`, staleTime 5min); `useCreateRequest()` mutación en `hooks/use-requests.ts` (POST /request, `invalidateQueries(["requests"])` onSuccess). Tipo payload `{ title, description, category_id, priority }` — añadir a `lib/interfaces/request.ts` si corresponde. **Nota real**: no existía `hooks/use-requests.ts` ni `lib/interfaces/request.ts`; la mutación y el tipo `CreateRequestPayload` quedaron en `hooks/use-user-requests.ts` (donde vive `UserRequest`).
- [x] T4 (frontend): `components/portal/create-request-sheet.tsx` — botón "Nueva solicitud" en `/portal` header que abre Sheet (componente existente) con formulario: título (Input), descripción (textarea nativo estilizado), categoría (select nativo desde useCategories), prioridad (select nativo con los 4 valores). Validación mínima client-side, error visible del backend (`error.response?.data?.message`), submit deshabilitado mientras pending, cerrar y resetear al éxito.
- [x] T5 (verify): `cd backend && npx eslint .` y `cd frontend && npm run lint && npm run build` deben pasar. Sin test suite.

## Evidence

- `npx eslint .` (backend) → exit 0. `npm run lint` y `npm run build` (frontend, Next 16.3.6 Turbopack) → exit 0.
- Verificador independiente: PASS. INSERT placeholders vs params ok, zod vs constraints DB ok, invalidación `["requests"]` ok, Sheet controlado sin trigger válido en Base UI.
- Fix post-verificación: `/categories` estaba montado dos veces en `app.js` — removido el duplicado; re-lint backend exit 0.
- Fixes de baseline preexistentes necesarios para que lint pase: `eslint.config.js` (+globals.node), `hooks/use-mobile.ts` (useSyncExternalStore).
- Pendiente manual: prueba end-to-end con Postgres levantado (login SOLICITANTE → crear → aparece en tabla).
- Estado: TODAS las tareas completas. Próximo paso: commit + PR según política del repo.

## Verificación (2026-09-25)

- `cd backend && npx eslint .` → **EXIT:0**. Se necesitaron 2 fixes de baseline (fallaban ya en HEAD): `eslint.config.js` usaba `globals.browser` en un proyecto Node (error `no-undef: process` en `env-vars.js`) → se agregó `globals.node`; y `_` sin usar en `request.service.js` (destructuring preexistente) → se reescribió el map para descartar `total_items` con `void`.
- `cd frontend && npm run lint` → **EXIT:0**. Fix de baseline en `hooks/use-mobile.ts` (preexistente, `react-hooks/set-state-in-effect`): migrado a `useSyncExternalStore` (snapshot `window.innerWidth < 768`, server snapshot `false`).
- `cd frontend && npm run build` → **EXIT:0** (Next.js 16.3.6 Turbopack; 10 páginas generadas, sin errores TS).

## Notas de estilo

- ESM con `.js` en imports locales (backend). UI en español, identificadores/comentarios en inglés.
- RequestsTable hoy no muestra created_at — no tocarla salvo mínimo (la tabla se refresca sola vía invalidación).
- Comentarios de ayuda existentes en español en middleware están bien.
