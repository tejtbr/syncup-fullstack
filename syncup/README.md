# SyncUp — Phase 1

Smart hybrid workplace presence platform.

## Project Structure

```
syncup/
├── docker-compose.yml              ← Spins up everything with one command
├── init.sql                        ← DB schema + seed data
├── syncup-presence-service/        ← Spring Boot backend (Java 17)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/syncup/presence/
│       ├── config/                 ← Security, WebSocket, Redis configs
│       ├── controller/             ← REST controllers (Auth, Status, Team, User)
│       ├── dto/                    ← Request/Response DTOs
│       ├── exception/              ← Global error handling
│       ├── model/                  ← JPA entities
│       ├── repository/             ← Spring Data JPA repos
│       ├── security/               ← JWT filter + util
│       ├── service/                ← Business logic
│       └── websocket/              ← STOMP real-time publisher
└── syncup-frontend/                ← React + Vite frontend
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/                    ← Axios client + API calls
        ├── components/             ← Reusable UI components
        ├── context/                ← AuthContext (JWT state)
        ├── hooks/                  ← useStatusWebSocket
        ├── pages/                  ← Dashboard, Login, Teams, TeamDetail
        └── styles/                 ← Tailwind CSS
```

## Quick Start (Docker — Recommended)

```bash
# Clone and start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

**Demo credentials** (seeded in init.sql):
| Email | Password | Role |
|---|---|---|
| alice@syncup.com | Password@123 | Admin |
| bob@syncup.com   | Password@123 | Employee |
| carol@syncup.com | Password@123 | Employee |
| dave@syncup.com  | Password@123 | Employee |

---

## Local Development (without Docker)

### Backend

**Prerequisites:** Java 17, Maven 3.9+, PostgreSQL 15, Redis

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE syncup_db;"
psql -U postgres -c "CREATE USER syncup_user WITH PASSWORD 'syncup_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE syncup_db TO syncup_user;"
psql -U syncup_user -d syncup_db -f init.sql

# 2. Run the Spring Boot service
cd syncup-presence-service
mvn spring-boot:run
# API will start at http://localhost:8080
```

### Frontend

**Prerequisites:** Node.js 20+

```bash
cd syncup-frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |

### Status
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/status/me` | Set my status for today |
| GET  | `/api/status/me?date=YYYY-MM-DD` | Get my status |
| GET  | `/api/status/team/{teamId}` | Team dashboard for today |
| GET  | `/api/status/summary` | Org-wide counts |
| GET  | `/api/status/locations` | Available office locations |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/teams` | Create a team |
| GET    | `/api/teams/my` | My teams |
| GET    | `/api/teams/{id}` | Team details |
| GET    | `/api/teams/{id}/members` | Team members |
| POST   | `/api/teams/{id}/members` | Add member |
| DELETE | `/api/teams/{id}/members/{userId}` | Remove member |
| DELETE | `/api/teams/{id}` | Delete team |

### WebSocket (STOMP)
- **Endpoint:** `ws://localhost:8080/ws`
- **Connect Header:** `Authorization: Bearer <jwt>`
- **Subscribe:** `/topic/status` — receive live status updates from all users

### Example: Set Status
```json
POST /api/status/me
Authorization: Bearer <token>
{
  "status": "IN_OFFICE",
  "officeLocationId": "<uuid>",
  "note": "In for the sprint planning!"
}
```

---

## Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/syncup_db` | PostgreSQL URL |
| `SPRING_DATASOURCE_USERNAME` | `syncup_user` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | `syncup_pass` | DB password |
| `SPRING_REDIS_HOST` | `localhost` | Redis host |
| `SPRING_REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | (change this!) | Min 256-bit secret |
| `JWT_EXPIRATION` | `86400000` | Token TTL in ms (24h) |

---

## What's Built (Phase 1)

- [x] JWT Authentication (login + register)
- [x] Daily status picker: In Office / Remote / On Leave / Undecided
- [x] Office location selection when In Office
- [x] Optional status note
- [x] Real-time updates via WebSocket (STOMP)
- [x] Team creation and member management
- [x] Team presence dashboard
- [x] Org-wide summary (counts per status)
- [x] Redis caching for team dashboards
- [x] Docker Compose for one-command startup

## Next Steps (Phase 2)

- Analytics microservice (department charts, location heatmaps)
- Weekly trends dashboard with Recharts
- Kafka event bus between services
- TimescaleDB for historical data
