# Barrio Seguro — Backend

## Descripción del proyecto

**Barrio Seguro** es una plataforma comunitaria de reportes anónimos sobre problemas de seguridad y espacios públicos en **Guayaquil, Ecuador**. Permite que los ciudadanos informen situaciones como alumbrado dañado, parques descuidados, huecos en la vía o preocupaciones de seguridad del barrio, sin necesidad de dar nombres, correos, cédulas ni teléfonos.

**Problema que resuelve:** muchas personas no reportan los problemas de su barrio por desconfianza, falta de tiempo o miedo a represalias. Barrio Seguro ofrece un canal simple y anónimo para visibilizar esos problemas y mostrar estadísticas por categoría, estado y sector.

> **Importante:** Barrio Seguro es una plataforma de **reportes comunitarios**, **no una denuncia oficial**. No reemplaza a las autoridades ni a los servicios de emergencia.

El **frontend** existe como un **prototipo visual en Figma** (React + Figma Make). Este repositorio contiene el backend y corresponde a la **primera entrega parcial: 50% de los endpoints** (5 de 10). Forma parte de un proyecto académico de Fullstack y servirá de base para un futuro proyecto de titulación.

## Perfiles de usuario y responsabilidades

### Ciudadano (anónimo)
- No requiere cuenta.
- Puede **crear reportes anónimos**, **consultar el listado** de reportes, **ver el detalle** de un reporte, **consultar las categorías** y **ver las estadísticas**.
- **No puede** moderar reportes ni cambiar estados.

### Moderador / Administrador
- Accede a la vista de administración (**endpoints pendientes en esta entrega**).
- Podrá **cambiar estados**, **ocultar reportes** que incumplan las normas y **ver reportes con filtros avanzados**.
- En una versión real **requerirá autenticación**.

> Ningún perfil puede publicar acusaciones contra personas identificables. Los reportes deben describir problemas del entorno, no señalar a individuos.

## Stack tecnológico

- Node.js + Express
- PostgreSQL con la librería `pg` (node-postgres)
- dotenv (variables de entorno)
- cors
- nodemon (solo desarrollo)
- JavaScript (sin TypeScript)

## Estructura del proyecto

```
barrio-seguro-backend/
├── package.json
├── README.md
├── .env.example
├── .gitignore
└── src/
    ├── server.js                  # Punto de entrada
    ├── app.js                     # Configuración de Express
    ├── routes/
    │   ├── index.js               # Agrupa rutas bajo /api
    │   ├── reports.routes.js
    │   ├── categories.routes.js
    │   └── stats.routes.js
    ├── controllers/               # Validación de entrada y respuestas HTTP
    │   ├── reports.controller.js
    │   ├── categories.controller.js
    │   └── stats.controller.js
    ├── services/                  # Lógica de negocio y consultas SQL
    │   ├── reports.service.js
    │   ├── categories.service.js
    │   └── stats.service.js
    ├── middlewares/
    │   └── errorHandler.js        # Manejo centralizado de errores
    ├── utils/
    │   └── httpError.js
    └── db/
        ├── pool.js                # Pool de conexión a PostgreSQL
        ├── schema.sql             # Tablas
        ├── seed.sql               # Datos de demostración
        └── setup.js               # Ejecuta schema.sql + seed.sql
```

## Instalación y ejecución local

Requisitos: Node.js 18+ y PostgreSQL en ejecución.

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/<TU_USUARIO>/<TU_REPO>.git
   cd <TU_REPO>
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear la base de datos en PostgreSQL y configurar el `.env`:
   ```bash
   createdb barrio_seguro
   cp .env.example .env
   # Edita .env y ajusta DATABASE_URL con tu usuario y contraseña
   ```
4. Crear las tablas y cargar los datos de demostración:
   ```bash
   npm run db:setup
   ```
   > Este comando **reinicia** las tablas (borra y recrea). Úsalo solo en desarrollo.
5. Iniciar el servidor:
   ```bash
   npm run dev     # desarrollo (nodemon)
   npm start       # producción
   ```

El servidor queda disponible en `http://localhost:3000`.

## Endpoints implementados

```
GET    /api/reports
GET    /api/reports/{id}
POST   /api/reports
GET    /api/categories
GET    /api/stats
```

| Endpoint | Descripción |
|---|---|
| `POST /api/reports` | Crea un reporte anónimo. Campos obligatorios: `title`, `category`, `description`, `sector`, `latitude`, `longitude`. Opcionales: `photo_url`, `incident_date` (`YYYY-MM-DD`). Genera `report_code` (`BS-XXXXXX`) y registra el estado inicial `RECIBIDO`. |
| `GET /api/reports` | Lista reportes visibles. Query params opcionales: `category`, `status`, `sector`, `search` (título o sector), `page` (def. 1), `limit` (def. 20, máx. 100). Responde `total`, `page`, `limit` y `reports`. |
| `GET /api/reports/{id}` | Detalle por `id` (UUID) o por `report_code`. Incluye `status_history`. 404 si no existe u está oculto. |
| `GET /api/categories` | Lista las categorías con su descripción. |
| `GET /api/stats` | Total de reportes, conteo por estado, conteo por categoría y top 5 sectores. |

### Endpoints pendientes (siguiente entrega)

```
PUT    /api/reports/{id}/status      (pendiente - admin)
DELETE /api/reports/{id}             (pendiente - admin, ocultar)
GET    /api/admin/reports            (pendiente - admin, filtros avanzados)
POST   /api/auth/login               (pendiente - admin)
GET    /api/sectors                  (pendiente - lista de sectores)
```

## Ejemplos de peticiones con curl

**Crear un reporte (POST):**
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Poste de luz apagado",
    "category": "Alumbrado público",
    "description": "El poste de la esquina no enciende desde hace una semana.",
    "sector": "Urdesa",
    "latitude": -2.17,
    "longitude": -79.905,
    "incident_date": "2026-11-10"
  }'
```

**Listar reportes (con filtros y paginación):**
```bash
curl "http://localhost:3000/api/reports"
curl "http://localhost:3000/api/reports?category=Infraestructura&status=EN_ATENCION&page=1&limit=10"
curl "http://localhost:3000/api/reports?search=luz&sector=Centro"
```

**Detalle de un reporte (por código o por UUID):**
```bash
curl http://localhost:3000/api/reports/BS-A1B2C3
curl http://localhost:3000/api/reports/00000000-0000-0000-0000-000000000001
```

**Categorías:**
```bash
curl http://localhost:3000/api/categories
```

**Estadísticas:**
```bash
curl http://localhost:3000/api/stats
```

Formato de errores: `{ "error": "mensaje", "details": ["..."] }` con códigos 400, 404 o 500.

## Estado del proyecto

**Implementado (50% — 5 de 10 endpoints):**
- Crear reporte anónimo con código `BS-XXXXXX` e historial inicial
- Listado con filtros, búsqueda y paginación
- Detalle por id o código con historial de estados
- Categorías
- Estadísticas agregadas
- Esquema SQL, datos semilla, manejo centralizado de errores y validación básica

**Pendiente (50%):**
- Cambio de estado por administrador
- Ocultar reportes (moderación)
- Vista de administración con filtros avanzados
- Autenticación de administradores
- Listado de sectores

## Nota legal y de privacidad

Barrio Seguro **no sustituye denuncias oficiales ni servicios de emergencia**. Ante una emergencia en Ecuador, llama al **911**. Los reportes son **información aportada por usuarios y no constituyen hechos verificados**. La plataforma no solicita ni almacena datos personales de quienes reportan, y no permite publicar acusaciones contra personas identificables.
