# SyncUp Project - Complete UML Diagrams & Architecture Documentation

## 📋 Overview
SyncUp is a **Smart Hybrid Workplace Presence Platform** built with React + Spring Boot that enables teams to track and manage employee presence (In Office, Remote, On Leave, Undecided) with real-time updates.

---

## 🏗️ 1. System Architecture & Component Diagram

**Purpose:** Shows all major system components and their interactions at the highest level.

### Key Components:
- **Client Tier**: React Frontend + Browser Extension
- **API Services**: Authentication, Status Management, Team Management, VibeCheck, Analytics
- **Cache Layer**: Redis for session and status caching
- **Data Tier**: PostgreSQL database
- **Real-time**: WebSocket/STOMP for live updates
- **Infrastructure**: Docker Compose orchestration

### Data Flow:
1. Frontend communicates with multiple REST APIs
2. WebSocket enables real-time status broadcasting
3. Redis caches frequently accessed data
4. PostgreSQL stores persistent data
5. Docker Compose manages all containers

---

## 🔐 2. Authentication & Login Sequence Diagram

**Purpose:** Detailed flow of user login and JWT token generation.

### Flow Steps:
1. User enters email & password in login form
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials against PostgreSQL
4. BCrypt password validation
5. On success: JWT token generated with 24-hour expiration
6. Token stored in browser localStorage
7. Subsequent requests include JWT in Authorization header

### Security Features:
- **JWT Claims**: Username (email), expiration, secret key (HS256)
- **Password Hashing**: BCrypt encryption stored in DB
- **Token Storage**: localStorage (client-side)
- **Token Validation**: On every protected endpoint request

---

## ⚡ 3. Status Update & Real-time Notification Flow

**Purpose:** Complete flow when a user updates their status and how it broadcasts to all team members in real-time.

### Flow Steps:
1. User (Alice) sets status to "IN_OFFICE"
2. UI sends POST request: `/api/status/me`
3. Backend validates and saves to PostgreSQL
4. Redis cache invalidated for team dashboards
5. StatusUpdatedEvent published to WebSocket /topic/status
6. WebSocket broadcasts to all subscribed clients
7. Bob's dashboard updates in real-time showing Alice's new status
8. Future: Event published to Kafka for analytics

### Technologies Used:
- **Spring STOMP**: Message broker for WebSocket
- **Redis Cache**: Stores and invalidates dashboard data
- **PostgreSQL**: Persists status records
- **Event-Driven**: Decouples real-time updates from persistence

---

## 👥 4. Team Management Flow - Create & Add Members

**Purpose:** Shows how managers create teams and add members.

### Flow Steps:
1. Manager (Alice) clicks "Create Team"
2. Fills in team name and description
3. Frontend sends POST request: `/api/teams`
4. Backend creates team record and adds creator as member
5. Returns teamId and success response
6. Manager adds members to team via `/api/teams/{teamId}/members`
7. System verifies each user exists
8. TeamMember relationship created in database
9. Success response with member details

### Database Operations:
- **Create**: INSERT into teams table
- **Add Creator**: INSERT into team_members (role='MEMBER')
- **Add Member**: Verify user exists, then INSERT into team_members
- **Relationships**: One-to-many between Team and TeamMember

---

## 📊 5. Team Dashboard - Live Status View Sequence

**Purpose:** How the team dashboard loads initial data and subscribes to real-time updates.

### Flow Steps:
1. User opens Team Dashboard
2. Frontend fetches team data: `/api/status/team/{teamId}`
3. Redis cache check:
   - **Cache Hit**: Return cached statuses
   - **Cache Miss**: Query PostgreSQL, store in Redis with TTL
4. Dashboard rendered with all members and their statuses
5. Frontend subscribes to WebSocket: `/topic/status`
6. Live Update Loop:
   - Every status change triggers StatusUpdatedEvent
   - WebSocket pushes update to all connected clients
   - UI updates member row in real-time
   - Bob sees Alice's status change instantly

### Performance Optimization:
- **Caching Strategy**: Redis cache with TTL for team dashboards
- **Lazy Loading**: Status loaded on-demand
- **Real-time**: WebSocket prevents polling overhead
- **Broadcast**: Single event reaches all clients

---

## 🗄️ 6. Domain Model & Class Diagram

**Purpose:** UML class diagram showing data entities and relationships.

### Core Entities:

#### User
- **UUID** id
- **String** email (unique)
- **String** password (BCrypt hashed)
- **String** fullName, department
- **String** avatarUrl
- **Role** (ADMIN, EMPLOYEE)
- **Timestamps** createdAt, updatedAt

#### Team
- **UUID** id
- **String** name, description
- **UUID** createdBy (references User)
- **Timestamps** createdAt, updatedAt

#### TeamMember
- **UUID** id
- **UUID** teamId, userId (foreign keys)
- **String** role (MEMBER, ADMIN)
- **Timestamp** joinedAt

#### UserStatus
- **UUID** id
- **UUID** userId (foreign key)
- **Status** enum (IN_OFFICE, REMOTE, ON_LEAVE, UNDECIDED)
- **LocalDate** statusDate (unique per user per day)
- **UUID** officeLocationId
- **String** note
- **Timestamps** createdAt, updatedAt

#### OfficeLocation
- **UUID** id
- **String** name, city, country
- Predefined locations: USA, Bangalore, Canada

#### StatusUpdatedEvent
- **UUID** userId, **String** userEmail
- **Status** status, **LocalDate** date
- **OfficeLocation** location
- **Timestamp** timestamp

### Relationships:
- User creates Teams (1:N)
- User has multiple UserStatuses (1:N) - one per day
- User belongs to Teams via TeamMember (N:N)
- Team contains TeamMembers (1:N)
- UserStatus refers to OfficeLocation (N:1)
- UserStatus generates StatusUpdatedEvent (1:1)

---

## 🎯 7. User Journey - Activity Flow

**Purpose:** Complete user workflow from login to status updates.

### Main Paths:

#### Authentication Path:
1. User visits SyncUp
2. Check authentication status
3. If not authenticated: Show login page
4. Enter credentials → Validate → Create JWT → Store token
5. If authenticated: Go to Dashboard

#### Dashboard Activities:
1. **View Teams**: See my teams → Select team → View team dashboard
2. **Create Team**: Fill team info → Add members → Team created
3. **Set Status**: Choose status → Select location → Add note → Submit
4. Live updates via WebSocket broadcast
5. Status confirmed to user

#### Dashboard Interactions:
- Real-time status updates from team members
- Subscribe to WebSocket notifications
- Live dashboard refresh on changes

#### Logout:
1. Click logout button
2. Clear token from localStorage
3. Return to login page

---

## 🔄 8. Data Flow Diagram - Status Update

**Purpose:** Detailed step-by-step data transformation through each layer.

### Layer-by-Layer Flow:

#### 1. User Action
- Click status update button

#### 2. Frontend (React)
- Form component captures status
- Input validation
- Prepare request body
- Extract JWT token from localStorage
- Add JWT to Authorization header

#### 3. Network
- HTTP POST: `/api/status/me`
- Request includes:
  - JWT token in header
  - Status, location, note in body

#### 4. Backend Security
- JwtAuthFilter validates JWT signature
- Extract username from token
- Create authentication context
- Pass to protected endpoint

#### 5. Controller & Service
- StatusController receives request
- StatusService processes update:
  - Fetch existing or create new
  - Validate location ID
  - Prepare response DTO

#### 6. Persistence Layer
- Query existing status or create new
- Execute SQL: INSERT/UPDATE user_statuses table
- Receive success confirmation

#### 7. Cache Layer
- Invalidate Redis cache entries
- Clear all teamDashboard_* keys
- Prevents stale data

#### 8. Real-time Broadcast
- Create StatusUpdatedEvent object
- Publish to WebSocket /topic/status
- All subscribed clients receive update
- STOMP message broker handles distribution

#### 9. Response
- Return HTTP 200 OK
- Include updated status in response
- Frontend shows confirmation
- UI refreshes if needed

---

## 🐳 9. Deployment Architecture - Docker Compose

**Purpose:** How all services are containerized and orchestrated.

### Containers:

#### Frontend Container
- **NGINX Server** (port 80/3000)
- Serves React Vite build
- Static file serving
- Proxy to backend for API calls

#### Backend Container
- **Spring Boot Service** (port 8080)
- Embedded Tomcat servlet container
- syncup-presence-service
- Depends on PostgreSQL & Redis healthchecks

#### Database Container
- **PostgreSQL 15** (port 5432)
- Database: syncup_db
- User: syncup_user
- Persistent volume: postgres_data
- Initialized with init.sql

#### Cache Container
- **Redis 7** (port 6379)
- Session storage
- Dashboard caching
- Performance optimization

### Configuration:
- **Environment Variables**:
  - SPRING_DATASOURCE_URL
  - JWT_SECRET (change in production!)
  - SPRING_REDIS_HOST
  - JWT_EXPIRATION (24 hours)

- **Health Checks**: All services have healthcheck endpoints
- **Dependencies**: Services wait for healthy dependencies
- **Volumes**: PostgreSQL data persisted across restarts

---

## 🔒 10. JWT Authentication Flow & Security

**Purpose:** Complete JWT lifecycle and security validation.

### Step 1: Token Generation
1. User login with credentials
2. Backend validates credentials
3. JwtUtil generates token with:
   - **Claims**: Username (email)
   - **Expiration**: 24 hours from now
   - **Signing Algorithm**: HS256
   - **Secret Key**: Min 256 bits

### Step 2: Token Usage (HTTP)
1. Frontend stores token in localStorage
2. Axios interceptor adds JWT to every request:
   - Header: `Authorization: Bearer eyJ...`
3. JwtAuthFilter validates on every request:
   - Extract token from header
   - Parse JWT
   - Verify signature with secret key
   - Check expiration time
   - If valid: Set SecurityContext
   - If invalid/expired: Return 401 Unauthorized
4. Frontend automatically redirects to login on 401

### Step 3: WebSocket Connection
1. Client initiates WebSocket connection to `/ws`
2. Send JWT in connect header: `Authorization: Bearer eyJ...`
3. WebSocket interceptor validates same as HTTP
4. If valid: Allow subscription
5. If invalid: Reject connection

### Security Features:
- **HS256 Signing**: Ensures token not tampered with
- **Expiration**: Limits token lifetime
- **Signature Verification**: Only backend with secret can validate
- **Stateless**: No server-side session storage needed
- **HTTPS Recommended**: Protect token in transit

---

## 📨 11. WebSocket Real-time Message Flow

**Purpose:** Complete WebSocket lifecycle and message broadcasting.

### Connection Phase:
1. **Client 1 (Alice)** connects to STOMP broker
2. Sends CONNECT with JWT in header
3. Server validates JWT
4. Server responds with CONNECTED
5. **Client 2 (Bob)** follows same process

### Subscription Phase:
1. Alice sends SUBSCRIBE to `/topic/status`
2. Broker sends RECEIPT
3. Bob sends SUBSCRIBE to `/topic/status`
4. Broker sends RECEIPT

### Message Broadcasting:
1. Alice updates status via REST API
2. StatusService saves to PostgreSQL
3. StatusService publishes to WebSocket:
   - Destination: `/topic/status`
   - Message: `StatusUpdatedEvent` JSON
4. STOMP broker broadcasts to all subscribers:
   - Alice receives message (confirm her own update)
   - Bob receives message (learns about Alice's status)
5. Each client updates their local UI

### Disconnection:
1. Alice sends DISCONNECT
2. Broker sends RECEIPT and cleans up subscription
3. Bob remains subscribed
4. No impact on other clients

---

## 🚨 12. Error Handling & Exception Flow

**Purpose:** How errors are caught, mapped, and returned to clients.

### Request Validation:
1. Request reaches controller
2. Validation check: Is input valid?
   - Invalid: MethodArgumentNotValidException
   - Valid: Continue processing

### Business Logic Validation:
1. Process request in service
2. Business logic checks:
   - User not found → EntityNotFoundException
   - Invalid credentials → BadCredentialsException
   - Permission denied → AccessDeniedException
   - Duplicate team → UniqueConstraintViolation
   - Success → Service returns Result

### Exception Mapping:
All exceptions caught by GlobalExceptionHandler:
- **400 Bad Request**: Validation errors with field details
- **401 Unauthorized**: Invalid credentials, expired JWT
- **403 Forbidden**: Insufficient permissions, access denied
- **404 Not Found**: Resource not found (user, team, etc)
- **409 Conflict**: Duplicate resource, constraint violation
- **500 Internal Error**: Unexpected errors with details

### Response Format:
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": ["Field validation errors"]
}
```

### Client-side Handling:
1. Receive error response
2. Check error status code
3. 401 → Clear token, redirect to login
4. Other errors → Show error toast
5. Log for debugging

---

## 🎨 13. Frontend Component Architecture

**Purpose:** React component hierarchy and state management.

### Main Structure:

#### App Router
- React Router v6 with route configuration
- Central entry point for all pages

#### Authentication
- **AuthContext**: Global state for token and user
- Provides login/logout functions
- **LoginPage**: Email/password form
- **RegisterPage**: New user registration

#### Pages (Connected to Router)
- **DashboardPage**: Main user dashboard
- **TeamPage**: Individual team view
- **TeamsListPage**: My teams list
- **AnalyticsPage**: Reports and metrics
- **VibeDashboardPage**: Mood analytics
- **LocationPage**: Office locations

#### Reusable Components
- **Layout**: Header + sidebar wrapper
- **StatusBadge**: Display status as colored badge
- **StatusPicker**: Select status from dropdown
- **OrgSummary**: Organization-wide view

#### Custom Hooks
- **useAuth**: Access AuthContext (token, user, login/logout)
- **useStatusWebSocket**: Connect to WebSocket, receive live updates

#### API Integration
- **Axios Client**: Configured with:
  - Base URL to backend
  - JWT token in every request (via interceptor)
  - 401 handling: Redirect to login on unauthorized
- **API Modules**:
  - authApi: Login, register
  - statusApi: Get/set status, team dashboard
  - teamApi: Create/manage teams
  - userApi: User profile, all users

#### State Management
- AuthContext: Global auth state
- Component local state: useState for UI state
- Response caching: Axios interceptors

---

## 📡 Key Technologies & Patterns

### Backend (Spring Boot)
- **Security**: JWT + Spring Security
- **Web**: Spring Web MVC, REST API
- **WebSocket**: Spring WebSocket + STOMP
- **Data**: Spring Data JPA, PostgreSQL
- **Cache**: Spring Cache + Redis
- **Messages**: STOMP for pub/sub
- **Validation**: Jakarta Validation
- **Logging**: SLF4J + Logback

### Frontend (React)
- **Build**: Vite for fast development
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP**: Axios with interceptors
- **WebSocket**: SockJS + STOMP client
- **Toasts**: React Hot Toast
- **Form Handling**: useState + controlled components

### Database
- **PostgreSQL 15**: Relational database
- **JPA**: Object-relational mapping
- **Migrations**: init.sql for schema
- **Indexing**: Optimized queries for performance

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **NGINX**: Reverse proxy for frontend
- **Redis**: In-memory cache

---

## 🔄 Data Persistence Strategy

### Create Operations:
```
Form Input → Validation → Repository.save() → PostgreSQL INSERT → Response DTO
```

### Update Operations:
```
Current Data + Changes → Validation → Repository.save() → PostgreSQL UPDATE → Cache Invalidate → WebSocket Broadcast
```

### Read Operations:
```
Query Request → Check Redis Cache → If Miss: PostgreSQL Query → Store in Cache → Response DTO
```

### Delete Operations:
```
Delete Request → Permission Check → Repository.delete() → PostgreSQL DELETE → Cache Invalidate
```

---

## 🎯 API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Status Management
- `POST /api/status/me` - Set my status for today
- `GET /api/status/me?date=YYYY-MM-DD` - Get my status
- `GET /api/status/team/{teamId}?date=YYYY-MM-DD` - Get team dashboard

### Team Management
- `POST /api/teams` - Create team
- `GET /api/teams/my` - My teams
- `GET /api/teams/{teamId}` - Team details
- `GET /api/teams/{teamId}/members` - Team members
- `POST /api/teams/{teamId}/members` - Add member
- `DELETE /api/teams/{teamId}/members/{userId}` - Remove member
- `DELETE /api/teams/{teamId}` - Delete team

### WebSocket
- Endpoint: `ws://localhost:8080/ws`
- Subscribe: `/topic/status`
- Connect Header: `Authorization: Bearer <jwt>`

---

## 📊 Database Schema Overview

### Tables:
1. **users**: User accounts and profiles
2. **teams**: Team definitions
3. **team_members**: Team membership (N:N relationship)
4. **user_statuses**: Daily status records (one per user per day)
5. **office_locations**: Predefined office locations

### Key Constraints:
- **UNIQUE(user_id, status_date)**: Only one status per user per day
- **UNIQUE(team_id, user_id)**: Can't add same user twice to team
- **Cascade Delete**: Deleting user/team removes related records
- **Indexes**: Optimized for date queries

---

## 🚀 Startup & Deployment

### Docker Compose Start:
```bash
docker-compose up --build
```

### Services Health:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432
- Cache: localhost:6379

### Demo Users (seeded in init.sql):
- alice@syncup.com (Admin)
- bob@syncup.com (Employee)
- carol@syncup.com (Employee)
- dave@syncup.com (Employee)
- **Password**: Password@123

---

## 📝 Summary

This document provides a complete understanding of the **SyncUp** project through 13 comprehensive UML diagrams and detailed explanations:

1. **System Architecture** - High-level component overview
2. **Authentication** - JWT login flow
3. **Status Updates** - Real-time notification cascade
4. **Team Management** - Team CRUD operations
5. **Dashboard** - Live status view with caching
6. **Domain Model** - Data entities and relationships
7. **User Journey** - Complete user workflow
8. **Data Flow** - Layer-by-layer transformation
9. **Deployment** - Docker containerization
10. **JWT Security** - Token lifecycle and validation
11. **WebSocket** - Real-time message broadcasting
12. **Error Handling** - Exception mapping and response
13. **Frontend Components** - React architecture and state

Each diagram can be used for documentation, team onboarding, system design reviews, or future enhancement planning.
