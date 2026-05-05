<div align="center">

```
███████╗ ██████╗  █████╗
██╔════╝██╔════╝ ██╔══██╗
███████╗██║  ███╗███████║
╚════██║██║   ██║██╔══██║
███████║╚██████╔╝██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝
```

**Sistema de Gestión Agroindustrial**

*Del campo al servidor — tecnología para los agricultores de Santander, Colombia 🌱*

---

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-latest-000000?style=flat-square&logo=fastify&logoColor=white)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ¿Qué es el SGA?

El **SGA** es el backend de una aplicación móvil Flutter pensada para **pequeños agricultores del departamento de Santander**. Permite registrar y hacer seguimiento digital de las labores agrícolas del día a día en finca: riego, fertilización, fumigación, control de plagas, temperatura y cosecha.

> *Antes: cuadernos y memoria. Ahora: trazabilidad, datos e historia productiva.*

El backend expone una **API REST documentada con OpenAPI 3.0**, construida sobre **arquitectura hexagonal**, principios **SOLID**, **DDD** y múltiples patrones de diseño. Está listo para desplegarse en AWS con CI/CD.

---

## Tabla de Contenido

- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura Hexagonal](#-arquitectura-hexagonal)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelo de Dominio](#-modelo-de-dominio)
- [API Endpoints](#-api-endpoints)
- [Casos de Uso](#-casos-de-uso)
- [Seguridad](#-seguridad)
- [Variables de Entorno](#-variables-de-entorno)
- [Primeros Pasos](#-primeros-pasos)
- [Scripts disponibles](#-scripts-disponibles)
- [Pruebas](#-pruebas)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Principios SOLID](#-principios-solid)
- [Contribuir](#-contribuir)

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Runtime | **Node.js 20+** | Ecosistema maduro, alto rendimiento async |
| Lenguaje | **TypeScript 5** | Tipado estático, refactoring seguro |
| Framework HTTP | **Fastify** | Schema-first, ~2× más rápido que Express |
| ORM | **Prisma** | Tipado end-to-end, migraciones versionadas |
| Base de datos | **PostgreSQL 16** | Relacional robusta, soporte JSON nativo |
| Caché | **Redis 7** | Sesiones, rate limiting, queries frecuentes |
| Auth | **JWT RS256 + refresh tokens rotados** | Claves asimétricas, tokens de corta vida |
| Validación | **Zod** | Schemas declarativos, integración TypeScript |
| DI Container | **TSyringe** | Ligero, decoradores, compatible con TS |
| Logging | **Pino** | JSON estructurado, ~5× más rápido que Winston |
| Docs | **OpenAPI 3.0** | Auto-generada desde Fastify |
| Testing | **Vitest + Supertest** | Rápido, HMR, compatible con ESM |
| Contenedores | **Docker** | Entorno reproducible dev/prod |

---

## 🏛 Arquitectura Hexagonal

```
┌──────────────────────────────────────────────────────────┐
│                      INTERFACES                          │
│         (HTTP Controllers · Routes · Middleware)         │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  APPLICATION                       │  │
│  │         (Use Cases · DTOs · Ports)                 │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │                 DOMAIN                       │  │  │
│  │  │  (Entities · Value Objects · Repo Interfaces)│  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                   INFRASTRUCTURE                         │
│        (Prisma · Redis · JWT · Bcrypt · Adapters)        │
└──────────────────────────────────────────────────────────┘
```

La **regla de dependencia** es estricta: las capas internas no conocen las externas. El `Domain` no importa nada de Prisma. Los `Use Cases` reciben repositorios por constructor gracias a **TSyringe**. Cambiar de PostgreSQL a MongoDB solo requiere una nueva implementación del adaptador.

---

## 📁 Estructura del Proyecto

```
sga-backend/
├── src/
│   ├── domain/
│   │   ├── entities/          # User, Farm, Lot, Activity, SensorReading
│   │   ├── value-objects/     # Email, Password, ActivityType, Quantity
│   │   ├── repositories/      # Interfaces: IUserRepo, IFarmRepo, IActivityRepo
│   │   ├── services/          # ActivityDomainService, FarmDomainService
│   │   └── errors/            # DomainError, NotFoundError, ValidationError...
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── auth/          # Login, Register, Refresh, Logout, ForgotPw, ResetPw, GetMe
│   │   │   ├── farms/         # GetFarms, GetFarmById, GetLots
│   │   │   ├── activities/    # GetActivities, Create, Update, Delete
│   │   │   ├── sensors/       # GetLatestSensorData
│   │   │   └── users/         # UpdateProfile, ChangePassword
│   │   ├── dtos/              # Request/Response DTOs
│   │   └── ports/             # ITokenService, IPasswordService, ICacheService...
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma/        # schema.prisma, PrismaClientSingleton, migrations/
│   │   │   └── repositories/  # PrismaUserRepo, PrismaFarmRepo, PrismaActivityRepo
│   │   ├── cache/             # RedisClientSingleton, RedisAdapter
│   │   ├── auth/              # JwtTokenService, BcryptPasswordService
│   │   ├── sensors/           # SensorAdapter
│   │   └── notifications/     # EmailAdapter
│   │
│   ├── interfaces/
│   │   └── http/
│   │       ├── routes/        # auth, farm, activity, sensor, user
│   │       ├── controllers/   # AuthCtrl, FarmCtrl, ActivityCtrl, SensorCtrl, UserCtrl
│   │       ├── middleware/    # authMiddleware, errorHandler, requestLogger
│   │       ├── validators/    # Zod schemas por dominio
│   │       ├── docs/          # Swagger setup
│   │       └── server.ts      # Configuración Fastify
│   │
│   ├── shared/
│   │   ├── result/            # Result<T,E>, Optional, PaginatedResult
│   │   ├── logger/            # Pino singleton
│   │   ├── config/            # env.ts validado con Zod
│   │   └── container/         # Registro TSyringe
│   │
│   └── main.ts                # Entry point
│
├── tests/
│   ├── unit/                  # Use cases con mocks
│   ├── integration/           # E2E con BD real (Docker)
│   └── mocks/                 # Repositorios y servicios mock
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## 🌾 Modelo de Dominio

### Entidades

```typescript
User        { id, name, email, hashedPassword, role, farmName?, farmId? }
Farm        { id, name, location, lots: Lot[] }
Lot         { id, name, crop }
Activity    { id, type: ActivityType, lotId, crop, quantity: Quantity, date, notes?, farmId }
SensorReading { temperature, humidity, updatedAt }
```

### Value Objects

| Value Object | Regla de negocio |
|-------------|-----------------|
| `Email` | Formato válido, inmutable |
| `Password` | Longitud mínima 8 caracteres |
| `ActivityType` | `Riego` · `Fertilización` · `Fumigación` · `Control de Plagas` · `Temperatura` · `Cosecha` · `Otro` |
| `Quantity` | `{ amount > 0, unit: string }` |

Todos se crean con `ValueObject.create()` que retorna `Result<VO, ValidationError>`.

### Jerarquía de Errores

```
DomainError (base)
├── ValidationError       → HTTP 400
├── AuthenticationError   → HTTP 401
├── AuthorizationError    → HTTP 403
├── NotFoundError         → HTTP 404
│   ├── FarmNotFoundError
│   ├── ActivityNotFoundError
│   └── UserNotFoundError
└── ConflictError         → HTTP 409
```

---

## 🔌 API Endpoints

Prefijo base: `/api/v1` · Documentación interactiva: `/documentation`

### Auth
```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

### Fincas
```
GET    /farms
GET    /farms/:id
GET    /farms/:id/lots
```

### Actividades
```
GET    /farms/:id/activities   ?page&limit&type
POST   /activities
PUT    /activities/:id
DELETE /activities/:id
```

### Sensores
```
GET    /farms/:id/sensors/latest
```

### Usuarios
```
PUT    /users/me
PUT    /users/me/password
```

---

## ⚙️ Casos de Uso

Todos los casos de uso retornan `Result<T, DomainError>` — sin excepciones, sin surpresas.

<details>
<summary><strong>Auth (7 casos de uso)</strong></summary>

| Caso de uso | Descripción |
|------------|-------------|
| `LoginUseCase` | Verifica credenciales, genera access + refresh token, guarda hash |
| `RegisterUseCase` | Valida email/password, hashea, crea usuario, genera tokens |
| `RefreshTokenUseCase` | Verifica refresh, revoca el antiguo, rota nuevos tokens |
| `LogoutUseCase` | Revoca todos los refresh tokens del usuario |
| `ForgotPasswordUseCase` | Token de reseteo en Redis, envía email |
| `ResetPasswordUseCase` | Valida token Redis, actualiza contraseña hasheada |
| `GetMeUseCase` | Retorna perfil del usuario autenticado |
</details>

<details>
<summary><strong>Farms (3 casos de uso)</strong></summary>

| Caso de uso | Descripción |
|------------|-------------|
| `GetFarmsUseCase` | Lista fincas del usuario autenticado |
| `GetFarmByIdUseCase` | Obtiene finca con sus lotes |
| `GetLotsUseCase` | Lista lotes de una finca |
</details>

<details>
<summary><strong>Activities (4 casos de uso)</strong></summary>

| Caso de uso | Descripción |
|------------|-------------|
| `GetActivitiesUseCase` | Lista paginada con filtro por tipo |
| `CreateActivityUseCase` | Crea actividad validando tipo, finca y lote |
| `UpdateActivityUseCase` | Actualiza campos permitidos |
| `DeleteActivityUseCase` | Elimina actividad por ID |
</details>

---

## 🔒 Seguridad

| Mecanismo | Detalle |
|-----------|---------|
| **JWT RS256** | Claves asimétricas. Access token: 15 min. Refresh: 7 días |
| **Refresh rotation** | Cada uso revoca el anterior. Hash SHA256 en BD |
| **Bcrypt** | Cost factor 12 para contraseñas |
| **Rate limiting** | 100 req/min global · 10 req/min en endpoints de auth |
| **Helmet** | Cabeceras HTTP seguras (CSP, HSTS, X-Frame-Options...) |
| **CORS** | Solo orígenes explícitamente configurados |
| **Zod validation** | Todas las rutas validan antes de llegar al controller |
| **Prisma** | Queries parametrizadas — SQL injection imposible |

---

## 🌿 Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable | Default | Requerida |
|----------|---------|-----------|
| `NODE_ENV` | `development` | |
| `PORT` | `3000` | |
| `DATABASE_URL` | — | ✅ |
| `JWT_PRIVATE_KEY` | — | ✅ |
| `JWT_PUBLIC_KEY` | — | ✅ |
| `ACCESS_TOKEN_EXPIRY_MINUTES` | `15` | |
| `REFRESH_TOKEN_EXPIRY_DAYS` | `7` | |
| `REDIS_URL` | — | ✅ |
| `CORS_ORIGINS` | `*` | |
| `LOG_LEVEL` | `info` | |
| `BCRYPT_SALT_ROUNDS` | `12` | |
| `MAX_ACTIVITIES_PER_PAGE` | `100` | |

---

## 🚀 Primeros Pasos

### Prerrequisitos

- Node.js 20+
- Docker y Docker Compose
- Git

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sga-backend.git
cd sga-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 4. Levantar PostgreSQL y Redis con Docker
docker-compose up -d

# 5. Aplicar migraciones y seed
npm run migrate
npm run seed

# 6. Generar cliente Prisma
npm run generate

# 7. Iniciar en desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`
La documentación Swagger en `http://localhost:3000/documentation`

### Con Docker completo

```bash
docker-compose up --build
```

---

## 📜 Scripts Disponibles

```bash
npm run dev              # Desarrollo con hot-reload
npm run build            # Compila TypeScript → dist/
npm start                # Ejecuta versión compilada
npm test                 # Todos los tests con Vitest
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests + reporte de cobertura
npm run migrate          # Aplica migraciones (desarrollo)
npm run migrate:prod     # Aplica migraciones (producción)
npm run seed             # Inserta datos de prueba
npm run generate         # Genera cliente Prisma
npm run lint             # ESLint
```

---

## 🧪 Pruebas

```bash
# Unitarias (use cases con mocks — sin BD)
npm test tests/unit

# Integración (BD real en Docker)
npm test tests/integration

# Cobertura completa
npm run test:coverage
```

### Cobertura objetivo

| Capa | Mínimo |
|------|--------|
| Use Cases | 75% |
| Controllers | 60% |
| Domain | 80% |

### Ejemplos de tests

```typescript
// tests/unit/auth/LoginUseCase.spec.ts
describe('LoginUseCase', () => {
  it('should return tokens when credentials are valid')
  it('should return AuthenticationError when email does not exist')
  it('should return AuthenticationError when password is incorrect')
})

// tests/unit/activities/CreateActivityUseCase.spec.ts
describe('CreateActivityUseCase', () => {
  it('should create activity when farm and type are valid')
  it('should return FarmNotFoundError when farm does not exist')
  it('should return ValidationError when activity type is invalid')
})
```

---

## 🎨 Patrones de Diseño

| Patrón | Dónde |
|--------|-------|
| **Repository** | `IUserRepository`, `IFarmRepository`, `IActivityRepository` + implementaciones Prisma y mock |
| **Factory Method** | `ActivityType.fromString()`, `Email.create()`, `UserFactory.create()` |
| **Builder** | `ActivityQueryBuilder` — construye filtros opcionales (type, page, limit) |
| **Strategy** | `ITokenService` (JWT/mock), `INotificationService` (email/SMS/push) |
| **Chain of Responsibility** | Pipeline Fastify: rate limit → auth → validate → controller |
| **Singleton** | `PrismaClient`, `RedisClient`, `Logger` |
| **Decorator** | `@injectable()`, `@inject()` de TSyringe |
| **Observer** | `ActivityCreatedEvent` → listeners de notificación *(en desarrollo)* |

---

## ✅ Principios SOLID

```
S  Single Responsibility  → Cada Use Case hace UNA sola cosa
O  Open/Closed            → Nuevos repos sin modificar los existentes
L  Liskov Substitution    → PrismaRepo ↔ MockRepo sin romper nada
I  Interface Segregation  → ITokenService ≠ ICacheService ≠ IPasswordService
D  Dependency Inversion   → Use Cases reciben repos por constructor (TSyringe)
```

---

## 👥 Equipo

Proyecto desarrollado como parte del **Proyecto Integrador III**
Facultad de Ingeniería de Sistemas e Informática
Universidad Pontificia Bolivariana — Seccional Bucaramanga, 2026

| Integrante |
|-----------|
| Jean Pierre Alejandro Peña Vílchez |
| Gian Kieffer Toledo De La Cruz |
| Fernando Cancelado Figueroa |

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

*Construido con 💚 para los agricultores de Santander*

**SGA Backend** · Node.js · TypeScript · Fastify · PostgreSQL · Redis · AWS

</div> 
