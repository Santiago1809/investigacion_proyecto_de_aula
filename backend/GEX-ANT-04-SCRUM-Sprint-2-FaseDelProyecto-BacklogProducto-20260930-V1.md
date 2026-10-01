# GEX-ANT-04-SCRUM - Sprint 2 - Backlog del producto

## 1. Información general

Este documento presenta el backlog del Sprint 2 del proyecto de investigación, reconstruido a partir del código implementado. Cada historia de usuario se describe con su código, título, descripción en formato de historia (Como / Quiero / Para), criterios de aceptación, prioridad y estado.

- Código del grupo: GEX-ANT-04-SCRUM
- Sprint: 2
- Fase del proyecto: Backlog del producto
- Fecha: 2026-09-30
- Versión: V1

## 2. Objetivo del backlog

El backlog tiene como finalidad:

- consolidar las funcionalidades implementadas en el Sprint 2
- registrar la intención de negocio detrás de cada historia de usuario
- documentar los criterios de aceptación verificables en el código
- mantener la trazabilidad con el backlog del Sprint 1

## 3. Alcance del sprint

El Sprint 2 cubre la operación colaborativa sobre las solicitudes: asignación por parte del COORDINADOR, comentarios de trabajo, cambios de estado y cierre del ciclo por parte del SOLICITANTE.

## 4. Historias de usuario

### 4.1 HU05 — Asignación de solicitudes

- **Descripción:** Como COORDINADOR, quiero asignar una solicitud a un agente disponible, para distribuir el trabajo del equipo de soporte.
- **Criterios de aceptación:**
  - solo un usuario con rol COORDINADOR puede asignar solicitudes
  - solo se puede asignar a usuarios activos con rol AGENTE
  - una solicitud no puede tener más de una asignación vigente al mismo tiempo
  - la asignación genera un evento de auditoría y una notificación al agente
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.2 HU06 — Comentarios de trabajo

- **Descripción:** Como usuario con acceso a una solicitud, quiero agregar comentarios de trabajo, para comunicar avances y novedades del caso.
- **Criterios de aceptación:**
  - el AGENTE con asignación vigente y el COORDINADOR pueden comentar la solicitud
  - los comentarios no pueden estar vacíos
  - los comentarios no pueden modificarse ni eliminarse una vez creados
  - cada comentario genera un evento de auditoría
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.3 HU07 — Cambio de estado de la solicitud

- **Descripción:** Como usuario con permisos sobre una solicitud, quiero cambiar su estado, para reflejar el avance real del caso.
- **Criterios de aceptación:**
  - solo se permiten las transiciones definidas en el ciclo de vida (`NUEVO → ASIGNADO → EN_PROGRESO → RESUELTO → CERRADO`, con reapertura desde `RESUELTO` hacia `EN_PROGRESO`)
  - el cambio de estado queda registrado en el historial de estados con el usuario que lo realizó
  - los cambios de estado generan eventos de auditoría y notificaciones
  - al resolver o cerrar una solicitud se actualizan las fechas correspondientes
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.4 HU08 — Confirmación o reapertura de la solución

- **Descripción:** Como SOLICITANTE, quiero confirmar la solución de mi solicitud o reabrirla si no quedó resuelta, para cerrar el ciclo de atención.
- **Criterios de aceptación:**
  - al confirmar la solución, la solicitud pasa de `RESUELTO` a `CERRADO`
  - al pedir reapertura, la solicitud vuelve de `RESUELTO` a `EN_PROGRESO`
  - la reapertura genera un evento de auditoría
- **Prioridad:** ALTA
- **Estado:** Completado
