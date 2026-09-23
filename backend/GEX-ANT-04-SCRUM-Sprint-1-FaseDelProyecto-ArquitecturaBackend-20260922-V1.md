# GEX-ANT-04-SCRUM - Sprint 1 - Arquitectura del backend

## 1. Información general

Este documento describe la arquitectura del backend del proyecto de investigación, desarrollado con Node.js y Express. La aplicación está diseñada como una API REST modular, con separación de responsabilidades por capas para facilitar el mantenimiento, la escalabilidad y la integración con PostgreSQL.

- Código del grupo: GEX-ANT-04-SCRUM
- Sprint: 1
- Fase del proyecto: Desarrollo del backend base
- Fecha: 2026-09-22
- Versión: V1

## 2. Objetivo del backend

El backend tiene como finalidad:

- gestionar la lógica de negocio del sistema
- exponer endpoints para autenticación y operaciones del dominio
- validar datos entrantes mediante esquemas
- proteger recursos mediante JWT
- interactuar con PostgreSQL mediante consultas SQL
- mantener una estructura ordenada y reutilizable para futuras funcionalidades

## 3. Stack tecnológico

El backend usa las siguientes tecnologías principales:

- Node.js
- Express
- PostgreSQL
- pg para conexión a la base de datos
- JWT para autenticación
- bcrypt para encriptación de contraseñas
- dotenv para variables de entorno
- Zod para validación de datos
- ESM (módulos de JavaScript)

## 4. Estructura de carpetas

La organización del backend se presenta de la siguiente manera:

```text
backend/
├── server.js
├── package.json
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   └── env-vars.js
│   ├── controllers/
│   ├── repositories/
│   ├── routes/
│   └── services/
```

## 5. Capa de configuración

### 5.1 server.js

Este archivo es el punto de entrada de la aplicación. Aquí se inicializa el servidor Express y se levanta la escucha del puerto definido en las variables de entorno.

**Responsabilidad principal:**

- iniciar la aplicación
- abrir el puerto HTTP
- verificar que la base de datos esté disponible

### 5.2 src/config/env-vars.js

En esta capa se valida y centraliza la configuración de entorno con Zod.

Incluye variables como:

- PORT
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- JWT_SECRET
- JWT_EXPIRES_IN

Esto ayuda a evitar errores por configuración y asegurar que el backend no arranque con valores inválidos.

### 5.3 src/config/database.js

Este archivo crea el pool de conexión a PostgreSQL usando la librería pg.

**Responsabilidad principal:**

- centralizar la conexión a la base de datos
- reutilizar conexiones para todas las consultas
- encapsular la configuración del host, usuario, contraseña y nombre de la base de datos

## 6. Capa de rutas

La capa de rutas define los endpoints HTTP para autenticación.

**Principio de diseño:** la ruta solo delega la petición al controlador correspondiente, sin contener lógica de negocio.

## 7. Capa de controladores

El controlador recibe la solicitud HTTP, valida el cuerpo con Zod y delega la ejecución al servicio correspondiente.

**Responsabilidad principal:**

- validar entrada del cliente
- interpretar errores de validación
- responder con códigos HTTP apropiados
- devolver estructura de respuesta consistente

## 8. Capa de servicios

La lógica de negocio se centraliza en esta capa. Aquí se implementan operaciones como:

- validación de credenciales
- comparación de contraseñas con bcrypt
- generación de JWT
- creación de usuarios
- manejo de errores y mensajes de respuesta

**Importancia:**
Esta capa separa la lógica del negocio de la capa HTTP, evitando que los controladores contengan demasiada lógica.

### src/services/jwt.service.js

Este archivo se encarga de firmar los tokens JWT con el secreto configurado en el entorno.

**Responsabilidad principal:**

- crear un token con payload del usuario
- establecer expiración del token
- permitir la autenticación basada en token para futuras rutas protegidas

## 9. Capa de repositorios

Es la capa que interactúa directamente con la base de datos para las operaciones de usuarios.

Incluye funciones como:

- buscar usuario por email
- buscar usuario por username
- crear un nuevo usuario

**Ventaja:**
La lógica SQL queda aislada y reutilizable, sin mezclar consultas con la lógica de negocio.

## 10. Patrón de arquitectura empleado

El backend sigue una arquitectura modular por capas, con separación clara entre:

- configuración
- rutas
- controladores
- servicios
- repositorios

Esto facilita:

- testeo unitario
- mantenimiento del código
- incorporación de nuevas funcionalidades
- reducción de acoplamiento entre módulos

## 11. Principios de diseño aplicados

- Separación de responsabilidades
- Encapsulamiento de lógica de negocio
- Validación de entrada por schemas
- Centralización de configuración
- Reutilización de consultas a base de datos
- Seguridad mediante contraseñas hash y JWT
