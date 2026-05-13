# SyncUp Quick Reference Guide

## 🎯 Project Overview

**SyncUp** = Smart Hybrid Workplace Presence Platform

**Purpose**: Manage team presence/status (In Office, Remote, On Leave, Undecided) with real-time updates

**Stack**:
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Spring Boot 3 + Java 17
- Database: PostgreSQL 15
- Cache: Redis 7
- Real-time: WebSocket/STOMP
- Infrastructure: Docker Compose

---

## 📊 13 UML Diagrams Created

| # | Diagram Name | Type | Purpose |
|---|---|---|---|
| 1 | System Architecture & Components | **Component Diagram** | Show all major system parts and interactions |
| 2 | Authentication & Login | **Sequence Diagram** | JWT generation and login flow |
| 3 | Status Update & Real-time | **Sequence Diagram** | How status changes broadcast to users |
| 4 | Team Management | **Sequence Diagram** | Create teams and add members |
| 5 | Team Dashboard | **Sequence Diagram** | Load dashboard with live updates |
| 6 | Domain Model | **Class Diagram** | Database entities and relationships |
| 7 | User Journey | **Activity Diagram** | Complete user workflow from login to logout |
| 8 | Data Flow | **Data Flow Diagram** | Step-by-step data transformation |
| 9 | Deployment Architecture | **Deployment Diagram** | Docker containers and configuration |
| 10 | JWT Security | **Sequence Diagram** | Token lifecycle and validation |
| 11 | WebSocket Messages | **Sequence Diagram** | Real-time message broadcasting |
| 12 | Error Handling | **Activity Diagram** | Exception mapping and error responses |
| 13 | Frontend Components | **Component Diagram** | React architecture and state management |

---

## 🏗️ System Layers

### Tier 1: Presentation
- React Frontend (Vite)
- Browser Extension
- Responsive UI with Tailwind CSS

### Tier 2: API Services
- Authentication Service (JWT)
- Status Management Service
- Team Management Service
- VibeCheck Service (Analytics)
- Analytics Service

### Tier 3: Middleware
- JWT Auth Filter
- WebSocket/STOMP Broker
- Exception Handler
- Caching Layer

### Tier 4: Data Access
- Spring Data JPA Repositories
- Redis Cache
- PostgreSQL Database

---

## 🔄 Core Workflows

### Workflow 1: User Login
```
Email/Password → Validate → BCrypt Check → Generate JWT → Store Token → Redirect to Dashboard
```

### Workflow 2: Set Status
```
Choose Status → Validate → Save to DB → Invalidate Cache → Publish WebSocket Event → Broadcast to Team
```

### Workflow 3: View Team Dashboard
```
Load Request → Check Redis Cache → (Hit/Miss) → Load Members → Subscribe to WebSocket → Real-time Updates
```

### Workflow 4: Create Team
```
Enter Team Info → Create Team → Add Creator as Member → Add Other Members → Return Team ID
```

### Workflow 5: Real-time Update
```
User A Updates Status → Service Publishes Event → WebSocket Broadcasts → All Subscribed Users Get Update
```

---

## 📦 Key Entities

### User
```
- id (UUID)
- email (unique)
- password (bcrypt)
- fullName
- department
- role (ADMIN, EMPLOYEE)
```

### Team
```
- id (UUID)
- name
- description
- createdBy (User ID)
```

### UserStatus
```
- id (UUID)
- userId (Foreign Key)
- status (IN_OFFICE | REMOTE | ON_LEAVE | UNDECIDED)
- statusDate (LocalDate)
- officeLocationId
- note
- Unique Constraint: (userId, statusDate)
```

### OfficeLocation
```
- id (UUID)
- name
- city
- country
```

### TeamMember
```
- teamId (Foreign Key)
- userId (Foreign Key)
- role
- Unique Constraint: (teamId, userId)
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Register new user |

### Status
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/status/me` | Set my status |
| GET | `/api/status/me` | Get my status |
| GET | `/api/status/team/{id}` | Get team dashboard |

### Teams
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/teams` | Create team |
| GET | `/api/teams/my` | My teams |
| GET | `/api/teams/{id}` | Team details |
| GET | `/api/teams/{id}/members` | Team members |
| POST | `/api/teams/{id}/members` | Add member |
| DELETE | `/api/teams/{id}/members/{uid}` | Remove member |
| DELETE | `/api/teams/{id}` | Delete team |

### Users
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/me` | Current user profile |
| GET | `/api/users` | All users |

### WebSocket
- **Endpoint**: `ws://localhost:8080/ws`
- **Topic**: `/topic/status`
- **Auth Header**: `Authorization: Bearer <jwt>`

---

## 🔐 Security Architecture

### JWT Token Flow
```
Login → Generate JWT (HS256) → Store in localStorage → Add to Authorization Header
→ JwtAuthFilter Validates → Extract User → Set SecurityContext → Allow Request
```

### Token Structure
- **Algorithm**: HS256 (HMAC SHA256)
- **Claims**: 
  - `sub`: username (email)
  - `iat`: issued at
  - `exp`: expiration (24 hours)
- **Secret**: Min 256-bit key

### Protected Endpoints
- All `/api/status/*` endpoints
- All `/api/teams/*` endpoints
- All `/api/users/*` endpoints
- WebSocket connection

### Error Responses
| Code | Meaning | Trigger |
|------|---------|---------|
| 400 | Bad Request | Invalid input validation |
| 401 | Unauthorized | Invalid/missing JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/constraint violation |
| 500 | Server Error | Unexpected error |

---

## 💾 Database Schema

### Connection String
```
jdbc:postgresql://postgres:5432/syncup_db
User: syncup_user
Password: syncup_pass
```

### Tables
- `users` - User accounts
- `teams` - Team definitions
- `team_members` - N:N relationship
- `user_statuses` - Daily status records
- `office_locations` - Office locations

### Indexes
```
idx_user_statuses_date (status_date)
idx_user_statuses_user_date (user_id, status_date)
```

---

## ⚡ Real-time Communication

### STOMP Protocol Flow
```
Client → CONNECT (with JWT) → Server validates → CONNECTED
Client → SUBSCRIBE /topic/status → RECEIPT
Server → Send message on /topic/status → All subscribers receive
Client → DISCONNECT → Clean up
```

### Message Format (JSON)
```json
{
  "userId": "uuid",
  "userEmail": "alice@syncup.com",
  "status": "IN_OFFICE",
  "statusDate": "2024-05-13",
  "location": {
    "id": "uuid",
    "name": "USA",
    "city": "Andover, Massachusetts"
  },
  "timestamp": "2024-05-13T10:30:00Z"
}
```

### Broadcast Mechanism
```
Status Update → Create Event → Publish to /topic/status 
→ STOMP Broker → Find all subscribers → Send to each client
→ Client WebSocket handler → Update UI
```

---

## 🐳 Docker Architecture

### Containers
```
┌─────────────────────────────────────┐
│    Docker Compose Network           │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  Frontend (NGINX + React)       │ │
│ │  Port: 80/3000                  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │  Backend (Spring Boot)          │ │
│ │  Port: 8080                     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │  PostgreSQL                     │ │
│ │  Port: 5432                     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │  Redis                          │ │
│ │  Port: 6379                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Environment Variables
```
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/syncup_db
SPRING_DATASOURCE_USERNAME=syncup_user
SPRING_DATASOURCE_PASSWORD=syncup_pass
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
JWT_SECRET=syncup-super-secret-jwt-key-change-in-production-min-256-bits
JWT_EXPIRATION=86400000 (24 hours in milliseconds)
```

### Startup Command
```bash
docker-compose up --build
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 👥 Demo Users

All passwords: `Password@123`

| Email | Role | Department |
|-------|------|-----------|
| alice@syncup.com | ADMIN | Engineering |
| bob@syncup.com | EMPLOYEE | Engineering |
| carol@syncup.com | EMPLOYEE | Finance |
| dave@syncup.com | EMPLOYEE | HR |

---

## 📱 Frontend Structure

### Routes
```
/               → Dashboard (protected)
/login          → Login page
/register       → Registration page
/teams          → My teams list
/teams/{id}     → Team dashboard
/analytics      → Analytics dashboard
/vibe           → Mood/vibe dashboard
/locations      → Office locations
```

### Context API
- **AuthContext**: Manages login state, token, user info

### Custom Hooks
- **useAuth()**: Access auth context
- **useStatusWebSocket()**: Connect to real-time updates

### Key Components
- Layout (header + sidebar)
- LoginPage, RegisterPage
- DashboardPage (main)
- TeamPage (team view)
- StatusBadge, StatusPicker
- OrgSummary

---

## 🔄 Caching Strategy

### Redis Cache Keys
```
teamDashboard_{teamId}_{date} → Team members' statuses
```

### Cache Invalidation Triggers
- User updates their status → Invalidate all teamDashboard_* keys
- User deleted from team → Invalidate team cache
- Default TTL: Configurable in Spring Cache

### Cache Flow
```
Request → Check Redis → Hit: Return → Miss: Query DB → Store in Redis → Return
```

---

## 📈 Performance Optimizations

1. **Caching**: Redis cache for frequently accessed dashboards
2. **Real-time**: WebSocket instead of polling
3. **Indexing**: Optimized database indexes on date queries
4. **Lazy Loading**: Load team members on demand
5. **Pagination**: (Future) Load users/teams with pagination
6. **Connection Pooling**: HikariCP for database connections

---

## 🔄 Data Flow Summary

### Status Update Flow
```
Frontend Form Input
    ↓
Validation + JWT Extract
    ↓
HTTP POST /api/status/me (with JWT header)
    ↓
JWT Auth Filter validates
    ↓
Status Controller receives
    ↓
Status Service processes
    ↓
Repository saves to PostgreSQL
    ↓
Cache invalidated
    ↓
WebSocket Event created
    ↓
STOMP Broker publishes
    ↓
All subscribed clients receive
    ↓
React components update UI
    ↓
Users see real-time change
```

---

## 🚀 Common Operations

### Adding a User to Team
```
1. Manager clicks "Add Member"
2. Select user from list
3. POST /api/teams/{teamId}/members {userId}
4. Insert into team_members table
5. Confirm to manager
```

### Viewing Team Status
```
1. User clicks team
2. GET /api/status/team/{teamId}
3. Check Redis cache
4. If miss: Query all team members' statuses
5. Return member list with statuses
6. Subscribe to /topic/status
7. Live updates arrive as team changes
```

### Setting My Status
```
1. User clicks "Set Status"
2. Choose status (IN_OFFICE, REMOTE, etc)
3. Select office location if needed
4. POST /api/status/me
5. Server saves and broadcasts
6. All team members see update in real-time
```

---

## 🎯 Key Design Patterns

| Pattern | Usage |
|---------|-------|
| **JWT** | Stateless authentication |
| **Spring Security** | Access control and filtering |
| **STOMP** | Real-time messaging |
| **Repository** | Data access abstraction |
| **DTO** | Request/response mapping |
| **Global Exception Handler** | Centralized error handling |
| **Cache Annotation** | Transparent caching |
| **Event Listener** | Decoupled event processing |
| **Context API** | Global state management (React) |
| **Custom Hooks** | Reusable logic (React) |

---

## 📝 File Organization

```
syncup-presence-service/
├── config/              ← Security, WebSocket, Redis, CORS
├── controller/          ← REST endpoints
├── dto/                 ← Request/Response objects
├── exception/           ← Custom exceptions
├── model/               ← JPA entities
├── repository/          ← Data access
├── security/            ← JWT, UserDetailsService
├── service/             ← Business logic
└── websocket/           ← WebSocket handler, publisher

syncup-frontend/
├── api/                 ← Axios client, API calls
├── components/          ← Reusable UI components
├── context/             ← Auth context
├── hooks/               ← Custom React hooks
├── pages/               ← Page components
└── styles/              ← Global CSS
```

---

## 🔗 External References

- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev
- **WebSocket/STOMP**: https://stomp.github.io
- **JWT**: https://jwt.io
- **Docker**: https://docker.com

---

## 💡 Future Enhancements

- [ ] Kafka for event streaming
- [ ] Elasticsearch for analytics
- [ ] GraphQL API
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Audit logging
- [ ] User roles/permissions
- [ ] API rate limiting
- [ ] Request/response compression
- [ ] Service-to-service communication

---

**Last Updated**: May 13, 2024
**Version**: 1.0
**Diagrams**: 13 comprehensive UML diagrams included
