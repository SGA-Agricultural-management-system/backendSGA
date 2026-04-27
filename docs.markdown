# 📘 Documentación Técnica Completa – Backend SGA (Sistema de Gestión Agroindustrial)

## 1. Introducción
Este documento describe de manera exhaustiva el backend del **Sistema de Gestión Agroindustrial (SGA)**. La aplicación está dirigida a pequeños agricultores de Santander, Colombia, y les permite registrar y hacer seguimiento de labores agrícolas (riego, fertilización, fumigación, control de plagas, temperatura, cosecha) en sus fincas y lotes de cultivo.

El backend está desarrollado siguiendo **arquitectura hexagonal (ports & adapters)**, principios **SOLID**, **Domain-Driven Design (DDD)** y múltiples patrones de diseño. Se expone una API REST documentada con OpenAPI 3.0 que es consumida por una app móvil Flutter existente.

---

## 2. Stack Tecnológico

| Componente       | Tecnología        | Justificación |
|------------------|-------------------|---------------|
| Entorno de ejecución | Node.js 20+   | Amplio ecosistema, alto rendimiento |
| Lenguaje         | TypeScript 5     | Tipado estático, mantenibilidad |
| Framework HTTP   | **Fastify**      | Rendimiento superior, schema-first, plugins oficiales de seguridad y documentación |
| ORM              | Prisma           | Tipado seguro, migraciones, queries parametrizadas |
| Base de datos    | PostgreSQL 16    | Robusta, soporte JSON, ideal para datos relacionales agrícolas |
| Autenticación    | JWT (RS256) + refresh tokens rotados | Estándar seguro, tokens firmados con par de claves |
| Caché            | Redis 7          | Sesiones, rate limiting, caché de consultas |
| Validación       | Zod              | Integración nativa con TypeScript, schemas declarativos |
| Documentación    | OpenAPI 3.0 (Swagger) | Auto-generada desde Fastify |
| Logging          | Pino             | JSON estructurado, alta velocidad |
| Inyección de dependencias | TSyringe | Ligero, decoradores, compatible con TypeScript |
| Testing          | Vitest + Supertest | Rápido, compatible con Vite, mocks integrados |
| Contenedores     | Docker (PostgreSQL, Redis) | Entorno reproducible en desarrollo y pruebas |

---

## 3. Arquitectura Hexagonal

La aplicación está organizada en **cuatro capas concéntricas** que respetan la regla de dependencia: las capas internas no conocen las externas.

1. **Domain** (`src/domain/`)
   - Entidades y value objects puros, sin dependencias de infraestructura.
   - Definición de errores de dominio.
   - Interfaces de repositorios (puertos secundarios).

2. **Application** (`src/application/`)
   - Casos de uso (lógica de negocio).
   - Puertos primarios (interfaces de servicios externos como auth, caché, notificaciones).
   - DTOs de entrada/salida.

3. **Infrastructure** (`src/infrastructure/`)
   - Adaptadores concretos: Prisma repos, Redis, JWT, bcrypt, sensores mock.

4. **Interfaces** (`src/interfaces/`)
   - Controladores HTTP, rutas Fastify, middleware (auth, rate limit, error handler), validadores Zod, documentación Swagger.

La comunicación entre capas se da mediante **inyección de dependencias** usando `tsyringe`. Nunca se instancian dependencias directamente en un caso de uso; se reciben por constructor.

---

## 4. Estructura del Proyecto
src/
├── domain/
│ ├── entities/ # User, Farm, Lot, Activity, SensorReading
│ ├── value-objects/ # Email, Password, ActivityType, Quantity
│ ├── repositories/ # Interfaces IUserRepository, IFarmRepository, IActivityRepository
│ ├── services/ # Domain services (ActivityDomainService, FarmDomainService)
│ ├── errors/ # Jerarquía de errores (DomainError, NotFoundError, etc.)
├── application/
│ ├── use-cases/
│ │ ├── auth/ # Login, Register, RefreshToken, Logout, ForgotPassword, ResetPassword, GetMe
│ │ ├── farms/ # GetFarms, GetFarmById, GetLots
│ │ ├── activities/ # GetActivities, Create, Update, Delete
│ │ ├── sensors/ # GetLatestSensorData
│ │ └── users/ # UpdateProfile, ChangePassword
│ ├── dtos/ # DTOs de request/response
│ ├── ports/ # ITokenService, IPasswordService, ICacheService, INotificationService, ISensorService
├── infrastructure/
│ ├── database/
│ │ ├── prisma/ # schema.prisma, PrismaClientSingleton, migraciones
│ │ ├── repositories/ # PrismaUserRepo, PrismaFarmRepo, PrismaActivityRepo
│ ├── cache/ # RedisClientSingleton, RedisAdapter
│ ├── auth/ # JwtTokenService, BcryptPasswordService
│ ├── sensors/ # SensorAdapter (mock)
│ ├── notifications/ # EmailAdapter (mock)
├── interfaces/
│ ├── http/
│ │ ├── routes/ # auth, farm, activity, sensor, user routes
│ │ ├── controllers/ # Auth, Farm, Activity, Sensor, User controllers
│ │ ├── middleware/ # authMiddleware, errorHandler, requestLogger
│ │ ├── validators/ # Zod schemas (auth, activity, user)
│ │ ├── docs/ # Swagger setup
│ │ └── server.ts # Configuración de Fastify
├── shared/
│ ├── result/ # Result monad (éxito/fallo), Optional, PaginatedResult
│ ├── logger/ # Pino logger
│ ├── config/ # Validación de variables de entorno con Zod
│ ├── container/ # Registro de dependencias con TSyringe
├── main.ts # Punto de entrada
tests/
├── unit/ # Tests de casos de uso
├── integration/ # Tests e2e con base de datos real
├── mocks/ # Repositorios y servicios mock
vitest.config.ts
tsconfig.json
package.json

---

## 5. Modelo de Dominio

### Entidades
- **User**: `{ id, name, email, hashedPassword, role, farmName?, farmId? }`
- **Farm**: `{ id, name, location }` + lista de `Lot`
- **Lot**: `{ id, name, crop }`
- **Activity**: `{ id, type: ActivityType, lotId, crop, quantity: Quantity, date, notes?, farmId }`
- **SensorReading**: `{ temperature, humidity, updatedAt }`

### Value Objects
- `Email`: validación de formato, inmutable.
- `Password`: validación de longitud mínima (8).
- `ActivityType`: enum `Riego | Fertilización | Fumigación | Control de Plagas | Temperatura | Cosecha | Otro`.
- `Quantity`: `{ amount: number, unit: string }`, amount > 0.

Todos los value objects se crean mediante un método estático `create` que retorna un `Result<ValueObject, ValidationError>`.

### Errores de Dominio
Jerarquía con código y statusCode HTTP mapeable:
DomainError (base)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
│ ├── FarmNotFoundError
│ ├── ActivityNotFoundError
│ └── UserNotFoundError
└── ConflictError (409)

---

## 6. Casos de Uso (Application Layer)

Cada caso de uso tiene una única responsabilidad y recibe sus dependencias inyectadas.

### Auth
| Caso de uso | Descripción |
|------------|-------------|
| **Login** | Verifica credenciales, genera access + refresh token, guarda hash del refresh token |
| **Register** | Valida email y password, hashea contraseña, crea usuario, genera tokens |
| **RefreshToken** | Verifica refresh token, revoca el antiguo, rota nuevos tokens |
| **Logout** | Revoca todos los refresh tokens del usuario |
| **ForgotPassword** | Genera token de reseteo (cache Redis), envía email (mock) |
| **ResetPassword** | Valida token, actualiza contraseña hasheada |
| **GetMe** | Retorna perfil del usuario autenticado |

### Farms
| Caso de uso | Descripción |
|------------|-------------|
| **GetFarms** | Lista fincas del usuario |
| **GetFarmById** | Obtiene finca con sus lotes |
| **GetLots** | Lista lotes de una finca |

### Activities
| Caso de uso | Descripción |
|------------|-------------|
| **GetActivities** | Lista paginada con filtro por tipo |
| **CreateActivity** | Crea actividad validando tipo, finca y lote |
| **UpdateActivity** | Actualiza campos permitidos |
| **DeleteActivity** | Elimina actividad por ID |

### Sensors
| Caso de uso | Descripción |
|------------|-------------|
| **GetLatestSensorData** | Obtiene última lectura de temperatura/humedad |

### Users
| Caso de uso | Descripción |
|------------|-------------|
| **UpdateProfile** | Actualiza nombre, nombre de finca |
| **ChangePassword** | Cambia contraseña validando la actual |

Todos los casos de uso retornan `Result<T, DomainError>` en lugar de lanzar excepciones.

---

## 7. Puertos e Interfaces (Application/Ports)

- `ITokenService`: `generateTokens(payload)`, `verifyAccessToken`, `verifyRefreshToken`, `hashToken`
- `IPasswordService`: `hash(plain)`, `compare(plain, hash)`
- `ICacheService`: `get`, `set`, `del`, `exists`
- `INotificationService`: `sendEmail`
- `ISensorService`: `getLatestByFarmId(farmId)`

Las implementaciones concretas están en `infrastructure/`.

---

## 8. Infraestructura

### Prisma ORM
- Esquema en `src/infrastructure/database/prisma/schema.prisma` con modelos `User`, `RefreshToken`, `Farm`, `Lot`, `Activity`, `SensorReading`.
- Singleton `PrismaClient` para toda la app.
- Repositorios concretos: `PrismaUserRepository`, `PrismaFarmRepository`, `PrismaActivityRepository`. Cada uno implementa la interfaz del dominio y traduce entidades de dominio ↔ modelos Prisma.

### Redis
- Singleton `RedisClientSingleton`.
- Adaptador `RedisAdapter` implementa `ICacheService`.
- Usado para almacenar tokens de reseteo de contraseña y podría extenderse a rate limiting.

### Autenticación
- `JwtTokenService`: firma con RS256 usando clave privada, verifica con clave pública. Hash de refresh tokens con SHA256.
- `BcryptPasswordService`: hash con cost 12, comparación segura.

### Sensores y Notificaciones
- `SensorAdapter`: devuelve la última lectura de `SensorReading` desde PostgreSQL (simula IoT).
- `EmailAdapter`: mock que imprime en logs.

---

## 9. Interfaces HTTP

### Fastify Server (`server.ts`)
Configuración central:
- Helmet (seguridad de cabeceras)
- CORS (orígenes configurables por variable de entorno)
- Rate limiting global (100 req/min por IP)
- Registro de rutas con prefijo `/api/v1`
- Documentación Swagger en `/documentation`

### Middleware
- **authMiddleware**: extrae token Bearer, verifica con `JwtTokenService`, añade `userId` y `role` al request.
- **errorHandler**: mapea errores (incluyendo `DomainError`) a respuestas JSON estructuradas.
- **requestLogger**: loguea todas las peticiones con Pino.

### Validadores (Zod)
Esquemas sincrónicos que se ejecutan como preHandler en las rutas:
- `authValidator`: login, register, refresh, forgot, reset.
- `activityValidator`: create, update, query.
- `userValidator`: update profile, change password.

Si falla la validación, se responde 400 con detalles.

### Controladores
Cada controlador inyecta los casos de uso correspondientes y traduce `Result` a respuestas HTTP.
- `AuthController`
- `FarmController`
- `ActivityController`
- `SensorController`
- `UserController`

Incluyen un método privado `handleError` que verifica `DomainError` para extraer `statusCode` y `code`.

### Rutas
Se registran en archivos separados y se montan bajo `/api/v1`:
- `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, etc.
- `GET /farms`, `GET /farms/:id`, `GET /farms/:id/lots`
- `GET /farms/:id/activities`, `POST /activities`, `PUT /activities/:id`, `DELETE /activities/:id`
- `GET /farms/:id/sensors/latest`
- `PUT /users/me`, `PUT /users/me/password`

---

## 10. Patrones de Diseño Implementados

- **Repository**: `IUserRepository`, `IFarmRepository`, `IActivityRepository` con implementaciones Prisma y mocks para tests.
- **Factory Method**: `ActivityType.fromString()`, `Email.create()`, etc.
- **Builder**: `ActivityQuery` para construir filtros de búsqueda.
- **Strategy**: `ITokenService` (JWT o mock), `INotificationService` (email, SMS, push).
- **Decorator**: (planeado para logs/caché con anotaciones TS)
- **Observer / Eventos**: (pendiente de implementar listeners de dominio)
- **Chain of Responsibility**: pipeline de middleware en Fastify (rate limit → auth → validate → controller)
- **Singleton**: `PrismaClient`, `RedisClient`, `Logger`.

---

## 11. Principios SOLID

- **S (Single Responsibility)**: cada caso de uso hace una sola cosa; cada repositorio gestiona una entidad.
- **O (Open/Closed)**: los repositorios implementan interfaces; añadir MongoDB implica nueva clase sin modificar la existente.
- **L (Liskov Substitution)**: `PrismaActivityRepository` puede sustituirse por `MockActivityRepository` en tests sin romper nada.
- **I (Interface Segregation)**: `ITokenService` solo firma/verifica; `ICacheService` solo get/set/del.
- **D (Dependency Inversion)**: los casos de uso reciben repositorios y servicios por constructor, nunca los instancian.

---

## 12. Configuración de Entorno

Variables de entorno validadas con Zod al inicio (`src/shared/config/env.ts`):

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno | `development` |
| `PORT` | Puerto HTTP | `3000` |
| `DATABASE_URL` | URL de conexión PostgreSQL | obligatorio |
| `JWT_PRIVATE_KEY` | Clave privada RSA | obligatorio |
| `JWT_PUBLIC_KEY` | Clave pública RSA | obligatorio |
| `ACCESS_TOKEN_EXPIRY_MINUTES` | Expiración access token | `15` |
| `REFRESH_TOKEN_EXPIRY_DAYS` | Expiración refresh token | `7` |
| `REDIS_URL` | URL de Redis | obligatorio |
| `CORS_ORIGINS` | Orígenes permitidos | `*` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `BCRYPT_SALT_ROUNDS` | Cost de bcrypt | `12` |
| `MAX_ACTIVITIES_PER_PAGE` | Límite de paginación | `100` |

Archivo `.env.example` disponible para copiar.

---

## 13. Seguridad

- **Autenticación**: JWT RS256 (claves asimétricas). Access token de 15 min, refresh token de 7 días.
- **Refresh tokens rotados**: en cada uso se revocan todos los anteriores y se emite uno nuevo, almacenado hasheado en BD.
- **Bcrypt**: cost 12 para contraseñas.
- **Rate limiting**: global (100 req/min) y por IP.
- **Helmet**: cabeceras HTTP seguras.
- **CORS**: solo orígenes configurados.
- **Validación**: Zod en todas las rutas antes de llegar al controlador.
- **SQL injection**: imposible con Prisma (queries parametrizadas).
- **Logs de auditoría**: login, logout, creación/edición/borrado de actividades (pendiente de implementación completa).

---

## 14. Manejo de Errores

La aplicación utiliza la clase `Result<T, E>` para encapsular éxito o fallo sin excepciones.

```typescript
// Éxito
return Result.ok(activity);
// Fallo
return Result.fail(new ActivityNotFoundError(id));

En la capa HTTP, el errorHandler global atrapa errores y, si son instancias de DomainError, responde con su statusCode y code. Si no, devuelve 500 genérico.

15. Contenedor de Dependencias (TSyringe)
Todas las dependencias se registran en src/shared/container/index.ts:

Repositorios: IUserRepository → PrismaUserRepository

Servicios: ITokenService → JwtTokenService, etc.

Adaptadores: ICacheService → RedisAdapter, INotificationService → EmailAdapter, ISensorService → SensorAdapter

Los controladores y casos de uso se resuelven automáticamente mediante decoradores @injectable() e @inject().

16. Pruebas
Configuración
Vitest con alias de rutas (igual que tsconfig).

Mocks de repositorios y servicios en tests/mocks/.

Base de datos de prueba PostgreSQL (Docker) o SQLite en memoria para integración rápida.

Unitarias
Prueban casos de uso aislados con mocks.

LoginUseCase: credenciales válidas, email no existe, contraseña incorrecta.

CreateActivityUseCase: actividad válida, finca no existe, tipo inválido.

Integración
Levantan la app Fastify con buildApp(), limpian la BD y ejecutan peticiones reales con app.inject().

Registro: 201 + tokens.

Login: 200 con credenciales correctas, 401 con incorrectas.



