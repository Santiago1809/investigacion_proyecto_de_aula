# GEX-ANT-04-SCRUM - Sprint 1 - Backlog del producto

## 1. Información general

Este documento presenta el backlog del producto del proyecto de investigación, reconstruido a partir del código implementado durante el Sprint 1. Cada historia de usuario se describe con su código, título, descripción en formato de historia (Como / Quiero / Para), criterios de aceptación, prioridad y estado.

- Código del grupo: GEX-ANT-04-SCRUM
- Sprint: 1
- Fase del proyecto: Backlog del producto
- Fecha: 2026-09-30
- Versión: V1

## 2. Objetivo del backlog

El backlog tiene como finalidad:

- consolidar las funcionalidades implementadas en el Sprint 1
- registrar la intención de negocio detrás de cada historia de usuario
- documentar los criterios de aceptación verificables en el código
- servir como base de planeación para los siguientes sprints

## 3. Roles y modelo de estados

Las historias se definen sobre los siguientes roles del sistema:

- SOLICITANTE: crea solicitudes y confirma o reabre las soluciones propuestas
- AGENTE: atiende las solicitudes que tiene asignadas
- COORDINADOR: asigna solicitudes, consulta la consola completa y exporta reportes
- AUDITOR: consulta el historial de auditoría del sistema

El ciclo de vida de una solicitud sigue las transiciones `NUEVO → ASIGNADO → EN_PROGRESO → RESUELTO → CERRADO`, con reapertura permitida desde `RESUELTO` hacia `EN_PROGRESO`.

## 4. Historias de usuario

### 4.1 HU01 — Login y control de acceso

- **Descripción:** Como usuario registrado, quiero iniciar sesión con mis credenciales, para acceder a las funcionalidades correspondientes a mi rol.
- **Criterios de aceptación:**
  - las credenciales inválidas responden con un mensaje genérico sin revelar información
  - el inicio de sesión exitoso devuelve un par de tokens JWT (acceso y actualización) y los datos básicos del usuario con sus roles
  - el acceso a rutas protegidas se controla por middleware de autenticación y por rol
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.2 HU02 — Registro de usuarios

- **Descripción:** Como visitante, quiero registrarme con email, nombre de usuario, nombre completo y contraseña, para obtener una cuenta de SOLICITANTE.
- **Criterios de aceptación:**
  - la contraseña se almacena cifrada con bcrypt (costo 12)
  - el registro asigna el rol de SOLICITANTE por defecto
  - no se permite registrar un email o nombre de usuario ya existente
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.3 HU03 — Creación de solicitudes

- **Descripción:** Como SOLICITANTE, quiero crear una solicitud con título, descripción, categoría y prioridad, para reportar una necesidad al área correspondiente.
- **Criterios de aceptación:**
  - el título y la descripción no pueden estar vacíos
  - la solicitud queda creada con estado `NUEVO`
  - la creación queda registrada en el historial de auditoría
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.4 HU04 — Portal del solicitante

- **Descripción:** Como SOLICITANTE, quiero ver el listado de mis solicitudes con paginación, para hacer seguimiento a su estado.
- **Criterios de aceptación:**
  - el listado solo muestra las solicitudes del usuario autenticado
  - la respuesta incluye metadatos de paginación
  - el listado está disponible en el portal del solicitante de la interfaz web
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.5 HU05 — Asignación de solicitudes

- **Descripción:** Como COORDINADOR, quiero asignar una solicitud a un agente disponible, para distribuir el trabajo del equipo de soporte.
- **Criterios de aceptación:**
  - solo un usuario con rol COORDINADOR puede asignar solicitudes
  - solo se puede asignar a usuarios activos con rol AGENTE
  - una solicitud no puede tener más de una asignación vigente al mismo tiempo
  - la asignación genera un evento de auditoría y una notificación al agente
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.6 HU06 — Comentarios de trabajo

- **Descripción:** Como usuario con acceso a una solicitud, quiero agregar comentarios de trabajo, para comunicar avances y novedades del caso.
- **Criterios de aceptación:**
  - el AGENTE con asignación vigente y el COORDINADOR pueden comentar la solicitud
  - los comentarios no pueden estar vacíos
  - los comentarios no pueden modificarse ni eliminarse una vez creados
  - cada comentario genera un evento de auditoría
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.7 HU07 — Cambio de estado de la solicitud

- **Descripción:** Como usuario con permisos sobre una solicitud, quiero cambiar su estado, para reflejar el avance real del caso.
- **Criterios de aceptación:**
  - solo se permiten las transiciones definidas en el ciclo de vida
  - el cambio de estado queda registrado en el historial de estados con el usuario que lo realizó
  - los cambios de estado generan eventos de auditoría y notificaciones
  - al resolver o cerrar una solicitud se actualizan las fechas correspondientes
- **Prioridad:** CRITICA
- **Estado:** Completado

### 4.8 HU08 — Confirmación o reapertura de la solución

- **Descripción:** Como SOLICITANTE, quiero confirmar la solución de mi solicitud o reabrirla si no quedó resuelta, para cerrar el ciclo de atención.
- **Criterios de aceptación:**
  - al confirmar la solución, la solicitud pasa de `RESUELTO` a `CERRADO`
  - al pedir reapertura, la solicitud vuelve de `RESUELTO` a `EN_PROGRESO`
  - la reapertura genera un evento de auditoría
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.9 HU09 — Búsqueda y filtros combinables

- **Descripción:** Como usuario del sistema, quiero buscar y filtrar solicitudes por texto, estado, prioridad y categoría, para encontrar casos con rapidez.
- **Criterios de aceptación:**
  - los filtros se pueden combinar entre sí
  - la búsqueda por texto aplica sobre título y descripción
  - la respuesta indica los filtros efectivamente aplicados
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.10 HU10 — Indicadores agregados

- **Descripción:** Como COORDINADOR, quiero consultar métricas agregadas de las solicitudes, para supervisar el desempeño del equipo.
- **Criterios de aceptación:**
  - las métricas se presentan agregadas en la consola del coordinador
  - los cálculos se obtienen desde el repositorio de métricas del backend
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.11 HU11 — Historial de auditoría

- **Descripción:** Como AUDITOR, quiero consultar el historial de eventos de auditoría, para verificar la trazabilidad de las operaciones del sistema.
- **Criterios de aceptación:**
  - se registran eventos de creación, cambio de prioridad, asignación, desasignación, cambio de estado, comentarios, confirmación de solución, reapertura y exportación de reportes
  - cada evento guarda actor, acción, valores anterior y nuevo, y fecha
  - el historial es consultable desde la sección de auditoría de la interfaz web
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.12 HU12 — Exportación de reportes en CSV

- **Descripción:** Como COORDINADOR, quiero exportar un reporte de solicitudes en formato CSV, para analizar la información fuera del sistema.
- **Criterios de aceptación:**
  - la exportación respeta los filtros aplicados en la consola
  - cada exportación queda registrada en auditoría con los filtros utilizados
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.13 HU13 — Mesa de trabajo del agente

- **Descripción:** Como AGENTE, quiero ver las solicitudes que tengo asignadas vigentes en una mesa de trabajo, para gestionar mis casos pendientes.
- **Criterios de aceptación:**
  - el listado `GET /request/assigned` solo devuelve las solicitudes con asignación vigente del agente autenticado
  - la asignación vigente se define por `unassigned_at IS NULL`
  - la mesa de trabajo soporta los mismos filtros y paginación que el listado general de la consola
  - el agente puede cambiar el estado y comentar desde el detalle de la solicitud
- **Prioridad:** ALTA
- **Estado:** Completado

### 4.14 HU14 — Gestión de categorías

- **Descripción:** Como administrador funcionales del catálogo, quiero disponer de categorías de solicitudes, para clasificar los casos reportados.
- **Criterios de aceptación:**
  - las categorías se consultan desde el endpoint y el repositorio dedicados
  - las categorías se pueden desactivar sin eliminarlas (flag `active`)
  - el seed incluye categorías de ejemplo en español
- **Prioridad:** MEDIA
- **Estado:** Completado

### 4.15 HU15 — Notificaciones a los usuarios

- **Descripción:** Como usuario del sistema, quiero recibir notificaciones por eventos relevantes de mis solicitudes, para enterarme de los cambios sin revisar manualmente.
- **Criterios de aceptación:**
  - se notifica al agente cuando se le asigna una solicitud
  - se notifica al agente y al solicitante cuando cambia el estado o se resuelve la solicitud
  - se notifica al solicitante cuando su solicitud es reabierta
  - las notificaciones se pueden marcar como leídas
- **Prioridad:** MEDIA
- **Estado:** Completado

## 5. Trabajo pendiente sugerido para próximos sprints

- Pruebas automatizadas de los flujos principales (autenticación, ciclo de vida de la solicitud, asignación)
- Endurecimiento de la búsqueda por texto (escape de comodines en la condición ILIKE)
- Gestión de usuarios desde la interfaz del COORDINADOR (desactivación, cambio de roles)
- Paginación y filtros del historial de auditoría por agente, acción y fecha
