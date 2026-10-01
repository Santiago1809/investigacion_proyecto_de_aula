# GEX-ANT-04-SCRUM - Sprint 1 - Backlog del producto

## 1. Información general

Este documento presenta el backlog del Sprint 1 del proyecto de investigación, reconstruido a partir del código implementado. Cada historia de usuario se describe con su código, título, descripción en formato de historia (Como / Quiero / Para), criterios de aceptación, prioridad y estado.

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

## 3. Alcance del sprint

El Sprint 1 cubre la base del sistema: autenticación, registro de usuarios y las primeras operaciones del SOLICITANTE.

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
