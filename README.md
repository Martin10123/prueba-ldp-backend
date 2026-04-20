# Scout Panel - Backend

Backend fullstack para una aplicación de scouting de jugadores de fútbol. Permite buscar, filtrar y comparar jugadores con sus estadísticas.

## 📋 Requisitos

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (via Docker)

## 🚀 Instalación y Ejecución

### 1. **Clonar el repositorio**

```bash
git clone <repo-url>
cd prueba-ldp-backend
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno**

```bash
copy .env.example .env
```

En Linux/macOS puedes usar:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scout_panel?schema=public"
JWT_SECRET="tu-secret-key-super-segura"
PORT=3000
```

### 4. **Iniciar PostgreSQL con Docker**

```bash
docker compose up -d --build
```

Este comando:
- Inicia un contenedor PostgreSQL
- Crea la base de datos `scout_panel`
- Crea el usuario `postgres` con contraseña `postgres`
- Expone PostgreSQL en `localhost:5433`

### 5. **Ejecutar migraciones y seed**

```bash
# Generar cliente Prisma
npm run prisma:generate

# Aplicar migraciones versionadas
npx prisma migrate deploy

# Llenar base de datos con datos de prueba
npx prisma db seed
```

Si haces cambios al schema durante desarrollo, crea una nueva migración con:

```bash
npx prisma migrate dev --name <nombre-cambio>
```

### 6. **Iniciar el servidor**

**Desarrollo:**

```bash
npm run dev
```

**Producción:**

```bash
npm run build
npm start
```

El servidor estará en `http://localhost:3000`

### 7. **Swagger / OpenAPI**

- UI interactiva: `http://localhost:3000/docs`
- Especificación JSON: `http://localhost:3000/docs.json`

## 📚 API Endpoints

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Login (devuelve JWT)
- `GET /auth/me` - Obtener datos del usuario autenticado (requiere JWT)

### Jugadores

- `GET /players` - Listar jugadores (con filtros)
  - Query params: `search`, `position`, `nationality`, `minAge`, `maxAge`, `page`, `limit`
  - `page` default: `1`
  - `limit` default: `10` (máximo `50`)
  - Ejemplo: `/players?position=ST&minAge=18&maxAge=28&page=1&limit=10`

Respuesta (paginada):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "name": "Lautaro Martinez",
        "birthDate": "1997-08-22T00:00:00.000Z",
        "nationality": "Argentina",
        "position": "ST",
        "photoUrl": "https://...",
        "currentTeamId": "clx...",
        "currentTeamName": "Inter",
        "createdAt": "2026-04-20T00:00:00.000Z",
        "updatedAt": "2026-04-20T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 23,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

- `GET /players/:id` - Obtener detalles de un jugador

- `GET /players/:id/stats` - Obtener estadísticas de un jugador
  - Query params: `seasonId` (opcional)

- `GET /players/compare?ids=id1,id2,id3` - Comparar 2-3 jugadores
  - Devuelve datos completos with stats de las últimas 2 temporadas

- `POST /players` - Crear nuevo jugador (protegido)
- `PATCH /players/:id` - Actualizar jugador (protegido)
- `DELETE /players/:id` - Eliminar jugador (protegido)

## 🔐 Autenticación

Todos los endpoints de `/players` requieren un JWT válido en el header:

```bash
Authorization: Bearer <token>
```

Para obtener un token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

## 📊 Modelo de datos

### User
- `id` - UUID único
- `name` - Nombre del usuario
- `email` - Email único
- `passwordHash` - Contraseña hasheada con bcryptjs
- `role` - USER | ADMIN
- `createdAt`, `updatedAt`

### Team
- `id` - UUID único
- `name` - Nombre del equipo
- `country` - País
- `logoUrl` - URL del logo (opcional)

### Player
- `id` - UUID único
- `name` - Nombre del jugador
- `birthDate` - Fecha de nacimiento
- `nationality` - Nacionalidad
- `position` - Posición (GK, CB, RB, LB, CDM, CM, CAM, RW, LW, ST)
- `photoUrl` - URL de foto (opcional)
- `currentTeamId` - FK a Team (para crear/editar)
- `currentTeamName` - Nombre del equipo actual (en respuesta)

### Season
- `id` - UUID único
- `year` - Año único (2024, 2023...)
- `name` - Nombre de la temporada (ej: "2024-2025")

### PlayerStats
- `id` - UUID único
- `playerId` - FK a Player
- `seasonId` - FK a Season
- `teamId` - FK a Team
- `matchesPlayed` - Partidos jugados
- `goals` - Goles
- `assists` - Asistencias
- `yellowCards` - Tarjetas amarillas
- `redCards` - Tarjetas rojas
- `minutesPlayed` - Minutos jugados

## 🛠️ Decisiones Técnicas

### 1. **Framework: Express + TypeScript**
- Express es lightweight y flexible
- TypeScript añade type-safety y mejora el Developer Experience
- Combo probado en producción

### 2. **ORM: Prisma**
- Schema como source of truth
- Auto-generate de tipos TypeScript (100% type-safe)
- Migraciones automáticas
- Seed tool integrado
- Query builder type-safe

### 3. **Autenticación: JWT + bcryptjs**
- JWT es stateless y escalable
- bcryptjs es estándar para hashing de contraseñas
- No requiere sesiones

### 4. **Validación: Zod**
- Runtime validation con IntelliSense
- Mejores mensajes de error que Joi
- TypeScript/JavaScript nativo

### 5. **Estructura del código**
```
controllers/  → Lógica HTTP (req/res)
services/     → Lógica de negocio
middlewares/  → Auth, error handling
routes/       → Definición de endpoints
types/        → TypeScript interfaces
lib/          → Utilidades (JWT, Prisma, etc)
```

### 6. **Database: PostgreSQL en Docker**
- SQL relacional perfecto para datos estruturados
- PostgreSQL es robusto y escalable
- Docker permite reproducibilidad del entorno

### 7. **Validación de edades**
- Se calcula dinámicamente a partir de `birthDate`
- No se almacena idade (evita desincronización)

## 🔄 Flujo de comparación de jugadores

```
GET /players/compare?ids=id1,id2,id3
  ↓
Validar que existan los 3 jugadores
  ↓
Obtener cada jugador + últimas 2 temporadas de stats
  ↓
Devolver array de jugadores con:
  - Datos básicos
  - currentTeam
  - stats[] (últimas 2 seasons)
    - season info
    - team info
    - estadísticas (goals, assists, etc)
```

Frontend puede renderizar:
- Tabla comparativa
- Gráficos radar (goals, assists, minutes, etc)
- Gráficos de barras (goals/assists por temporada)
- Evolución de rendimiento

## 🧪 Testing (Bonus)

Tests básicos implementados con Jest/Supertest:

```bash
npm test
```

Cobertura incluye:
- Unit tests de servicios
- Integration tests de endpoints
- Validación de JWT
- CRUD operations

## 🐛 Manejo de errores

Todas las respuestas siguen este formato:

**Success:**
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Mensaje descriptivo"
}
```

Códigos de error comunes:
- `VALIDATION_ERROR` - Parámetros/payload inválidos
- `UNAUTHORIZED` - Token faltante o inválido
- `NOT_FOUND` - Recurso no encontrado
- `EMAIL_ALREADY_EXISTS` - Email duplicado en registro
- `INVALID_CREDENTIALS` - Email/password incorrectos

## 🚨 Troubleshooting

### "Cannot reach database"
```bash
# Verificar que Docker está corriendo
docker compose ps

# Ver logs
docker compose logs postgres
```

### "Migration failed"
```bash
# Resetear la DB (⚠️ elimina todo)
npx prisma migrate reset
```

### "JWT_SECRET not found"
```bash
# Asegúrate que .env existe y tiene JWT_SECRET
cat .env | grep JWT_SECRET
```

## 📈 Qué mejoraría con más tiempo

### Performance
- [ ] **Paginación cursor-based** - Más eficiente que offset
- [ ] **Índices adicionales** - En búsquedas frecuentes (currentTeamId, seasonId)
- [ ] **Caché Redis** - Stats de jugadores populares
- [ ] **Lazy loading** - No cargar stats innecesariamente

### Seguridad
- [ ] **Rate limiting** - Prevenir abuso de API
- [ ] **CORS granular** - Solo dominio del frontend
- [ ] **Input sanitization** - Contra SQL injection (Prisma ya lo hace)
- [ ] **Audit logging** - Qué cambió y quién lo hizo

### Observabilidad
- [ ] **Logging estructurado** - Winston o Pino
- [ ] **Error tracking** - Sentry para excepciones
- [ ] **Métricas** - Prometheus/Grafana
- [ ] **Health checks** - /health endpoint más robusto

### Testing
- [ ] **E2E testing** - Cypress o Playwright
- [ ] **Load testing** - k6 o Apache JMeter
- [ ] **Coverage >80%** - Más casos y edge cases

### API
- [ ] **API Documentation** - Swagger/OpenAPI
- [ ] **Versionado** - /v1, /v2
- [ ] **Webhook** - Notificaciones cuando un jugador hace gol

### Admin features
- [ ] **Dashboard admin** - Ver logs, usuarios, estadísticas
- [ ] **Bulk import** - CSV de jugadores
- [ ] **Soft deletes** - No eliminar, marcar como inactivo

### DevOps
- [ ] **GitHub Actions** - CI/CD automático
- [ ] **Environment vars** - Diferentes configs (dev/staging/prod)
- [ ] **Database backups** - Automáticos
- [ ] **Kubernetes** - Para escalar horizontalmente

## 📝 Licencia

ISC

---

**Autor:** Martin Elias  
**Challenge:** Scout Panel - Tech Challenge Fullstack LDP  
**Fecha:** Abril 2025
