# GEX-ANT-04-SCRUM - Sprint 3 - Backlog del producto

## 1. Información general

Este documento presenta el backlog del Sprint 3 del proyecto de investigación, reconstruido a partir del código implementado. Cada historia de usuario se describe con su código, título, descripción en formato de historia (Como / Quiero / Para), criterios de aceptación, prioridad y estado.

- Código del grupo: GEX-ANT-04-SCRUM
- Sprint: 3
- Fase del proyecto: Backlog del producto
- Fecha: 2026-09-30
- Versión: V1

## 2. Objetivo del backlog

El backlog tiene como finalidad:

- consolidar las funcionalidades implementadas en el Sprint 3
- registrar la intención de negocio detrás de cada historia de usuario
- documentar los criterios de aceptación verificables en el código
- mantener la trazabilidad con los backlogs de los sprints 1 y 2

## 3. Alcance del sprint

El Sprint 3 cubre las capacidades de supervisión y análisis: búsqueda y filtros, indicadores agregados, historial de auditoría y exportación de reportes.

## 4. Historias de usuario

### 4.1 HU09 — Búsqueda y filtros combinables

- **Descripción:** Como usuario del sistema, quiero buscar y filtrar solicitudes por texto, estado, prioridad y categoría, para encontrar casos con rapidez.
- **Criterios de aceptación:**
  - los filtros se pueden combinar entre sí
  - la búsqueda por texto aplica sobre título y descripción
  - la respuesta indica los filtros efectivamente aplicados
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.2 HU10 — Indicadores agregados

- **Descripción:** Como COORDINADOR, quiero consultar métricas agregadas de las solicitudes, para supervisar el desempeño del equipo.
- **Criterios de aceptación:**
  - las métricas se presentan agregadas en la consola del coordinador
  - los cálculos se obtienen desde el repositorio de métricas del backend
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.3 HU11 — Historial de auditoría

- **Descripción:** Como AUDITOR, quiero consultar el historial de eventos de auditoría, para verificar la trazabilidad de las operaciones del sistema.
- **Criterios de aceptación:**
  - se registran eventos de creación, cambio de prioridad, asignación, desasignación, cambio de estado, comentarios, confirmación de solución, reapertura y exportación de reportes
  - cada evento guarda actor, acción, valores anterior y nuevo, y fecha
  - el historial es consultable desde la sección de auditoría de la interfaz web
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.4 HU12 — Exportación de reportes en CSV

- **Descripción:** Como COORDINADOR, quiero exportar un reporte de solicitudes en formato CSV, para analizar la información fuera del sistema.
- **Criterios de aceptación:**
  - la exportación respeta los filtros aplicados en la consola
  - cada exportación queda registrada en auditoría con los filtros utilizados
- **Prioridad:** MEDIA
- **Estado:** Completado

## 5. Funcionalidades adicionales implementadas

Las siguientes capacidades fueron implementadas durante el proyecto y quedan registradas para su asignación formal a un sprint:

### 5.1 Mesa de trabajo del agente

- **Descripción:** Como AGENTE, quiero ver las solicitudes que tengo asignadas vigentes en una mesa de trabajo, para gestionar mis casos pendientes.
- **Criterios de aceptación:**
  - el listado `GET /request/assigned` solo devuelve las solicitudes con asignación vigente del agente autenticado
  - la asignación vigente se define por `unassigned_at IS NULL`
  - la mesa de trabajo soporta los mismos filtros y paginación que el listado general de la consola
  - el agente puede cambiar el estado y comentar desde el detalle de la solicitud
- **Prioridad:** ALTA
- **Estado:** Completado

### 5.2 Gestión de categorías

- **Descripción:** Como administrador funcional del catálogo, quiero disponer de categorías de solicitudes, para clasificar los casos reportados.
- **Criterios de aceptación:**
  - las categorías se consultan desde el endpoint y el repositorio dedicados
  - las categorías se pueden desactivar sin eliminarlas (flag `active`)
  - el seed incluye categorías de ejemplo en español
- **Prioridad:** MEDIA
- **Estado:** Completado

### 5.3 Notificaciones a los usuarios

- **Descripción:** Como usuario del sistema, quiero recibir notificaciones por eventos relevantes de mis solicitudes, para enterarme de los cambios sin revisar manualmente.
- **Criterios de aceptación:**
  - se notifica al agente cuando se le asigna una solicitud
  - se notifica al agente y al solicitante cuando cambia el estado o se resuelve la solicitud
  - se notifica al solicitante cuando su solicitud es reabierta
  - las notificaciones se pueden marcar como leídas
- **Prioridad:** MEDIA
- **Estado:** Completado

## 6. Trabajo pendiente sugerido para próximos sprints

- Pruebas automatizadas de los flujos principales (autenticación, ciclo de vida de la solicitud, asignación)
- Endurecimiento de la búsqueda por texto (escape de comodines en la condición ILIKE)
- Gestión de usuarios desde la interfaz del COORDINADOR (desactivación, cambio de roles)
- Paginación y filtros del historial de auditoría por agente, acción y fecha
