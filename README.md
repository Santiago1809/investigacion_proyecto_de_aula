# GEX-ANT-04-SCRUM — Sistema de gestión de solicitudes

Sistema académico de gestión de solicitudes (mesa de ayuda) con backend en Express 5 (ESM) y frontend en Next.js 16. Las solicitudes tienen estados (`NUEVO`, `ASIGNADO`, `EN_PROGRESO`, `RESUELTO`, `CERRADO`) y prioridades (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`), con usuarios que asumen uno de los roles `SOLICITANTE`, `AGENTE`, `COORDINADOR` o `AUDITOR`.

## 1. Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior (la extensión `pgcrypto` se habilita desde el propio script SQL)

## 2. Estructura del repositorio

```text
├── bd/         # Script de creación de la base de datos PostgreSQL
├── backend/    # API REST (Express 5, ESM, pg, JWT, Zod)
└── frontend/   # Interfaz web (Next.js 16, React 19, next-auth v5)
```

No existe `package.json` en la raíz: cada aplicación gestiona sus propias dependencias y scripts.

## 3. Crear la base de datos

```bash
createdb investigacion_db
psql -d investigacion_db -f bd/base_de_datos.sql
```

El script crea los tipos enumerados, las tablas, los índices, las funciones y los triggers (transiciones de estado, auditoría y notificaciones).

## 4. Variables de entorno del backend

Crear un archivo `backend/.env` con, como mínimo:

| Variable | Descripción |
| --- | --- |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL (por defecto `5432`) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña del usuario de la base de datos |
| `JWT_SECRET` | Secreto de firma del token de acceso (mínimo 32 caracteres) |
| `JWT_REFRESH_SECRET` | Secreto del token de actualización (obligatorio en producción) |
| `NODE_ENV` | `development`, `test` o `production` |
| `PORT` | Puerto del backend (por defecto `3000`) |

En desarrollo conviene usar `PORT=3001`, porque el frontend espera el backend en `http://localhost:3001` por defecto.

Las variables se validan con Zod al arrancar: si falta alguna obligatoria, el backend termina el proceso con el error de validación.

## 5. Datos seed

Con el backend configurado (`.env` creado y base de datos aplicada):

```bash
cd backend
npm run seed
```

El script `src/scripts/seed.js` es idempotente: inserta los 4 roles del sistema, categorías de ejemplo y 4 usuarios iniciales, omitiendo lo que ya exista.

| Rol | Email | Contraseña |
| --- | --- | --- |
| COORDINADOR | admin@example.com | Admin1234! |
| AGENTE | agente@example.com | Agente1234! |
| SOLICITANTE | solicitante@example.com | Solicitante1234! |
| AUDITOR | auditor@example.com | Auditor1234! |

> **Advertencia:** estas credenciales son solo para desarrollo y pruebas académicas. Deben cambiarse antes de cualquier despliegue a producción.

## 6. Ejecución

### Backend

```bash
cd backend
npm install
npm run dev    # node --watch server.js
npm start      # ejecución sin watch
```

El backend termina inmediatamente si no logra conectar con la base de datos.

### Frontend

```bash
cd frontend
npm install
npm run dev    # puerto 3000
```

El frontend consume el backend con `NEXT_PUBLIC_BACKEND_URL` en el navegador y `BACKEND_URL` en el servidor; ambas variables por defecto apuntan a `http://localhost:3001`.

## 7. Notas de despliegue

- Al desplegar el frontend en Vercel hay que configurar `BACKEND_URL` y `NEXT_PUBLIC_BACKEND_URL` apuntando a la URL pública del backend.
- El backend debe incluir el origen de Vercel del frontend en la configuración de CORS de `backend/src/app.js`.

## 8. Calidad de código

El backend incluye configuración de ESLint (sin script en `package.json`):

```bash
cd backend
npx eslint .
```
