# RBAC Task Management Platform

A full-stack task management platform with Role-Based Access Control, built with NestJS, Angular, TypeORM, and SQLite.

## Workspace Layout

```
apps/
  api/           NestJS backend (REST API, JWT auth, RBAC guards)
  dashboard/     Angular frontend (Tailwind CSS, CDK drag-and-drop)
  api-e2e/       API end-to-end tests
libs/
  data/          Shared TypeScript interfaces and DTOs
  auth/          Reusable RBAC decorators and guards
```

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Backend    | NestJS, TypeORM, SQLite (better-sqlite3), JWT |
| Frontend   | Angular 21, TailwindCSS, Angular CDK          |
| Auth       | JWT tokens, bcrypt password hashing            |
| RBAC       | Custom decorators + guards, role inheritance   |
| Monorepo   | Nx workspace with npm workspaces               |

## Prerequisites

- **Node.js** >= 20.19.x (use `nvm use 20.19.1` if needed)
- **npm** >= 10.x

## Getting Started

### 1. Install dependencies

```bash
npm install
npm rebuild better-sqlite3
```

### 2. Start the API (Terminal 1)

```bash
npx nx serve @org/api
```

The API runs at **http://localhost:3000/api**.

### 3. Start the Dashboard (Terminal 2)

```bash
npx nx serve dashboard
```

The dashboard runs at **http://localhost:4200** and proxies `/api` requests to the backend.

### 4. Seed the database

```bash
curl -X POST "http://localhost:3000/api/dev/seed?org=Demo%20Org"
```

This creates:
- A parent organization ("Demo Org") and child organization
- Three roles: **Owner**, **Admin**, **Viewer** with appropriate permissions
- Demo user accounts (see below)

### 5. Log in

Open **http://localhost:4200** and use one of the demo accounts:

| Role   | Email            | Password   | Permissions                        |
|--------|------------------|------------|------------------------------------|
| Owner  | owner@demo.com   | owner123   | Full access (tasks, audit, roles)  |
| Admin  | admin@demo.com   | admin123   | Task CRUD + audit log read         |
| Viewer | viewer@demo.com  | viewer123  | Read-only access to tasks          |

## Data Models

- **Users** — email/password authentication with bcrypt
- **Organizations** — 2-level hierarchy (parent/child)
- **Roles** — Owner, Admin, Viewer (scoped per organization)
- **Permissions** — granular keys (task:read, task:create, audit:read, etc.)
- **UserOrgRole** — maps users to roles within organizations
- **Tasks** — title, description, status, category, org-scoped
- **AuditLog** — tracks all task operations with user/org context

## API Endpoints

| Method | Endpoint          | Permission    | Description                |
|--------|-------------------|---------------|----------------------------|
| POST   | /api/auth/register| Public        | Register a new user        |
| POST   | /api/auth/login   | Public        | Log in and get JWT         |
| POST   | /api/tasks        | task:create   | Create a task              |
| GET    | /api/tasks        | task:read     | List accessible tasks      |
| PUT    | /api/tasks/:id    | task:update   | Update a task              |
| DELETE | /api/tasks/:id    | task:delete   | Delete a task              |
| GET    | /api/audit-log    | audit:read    | View audit logs            |
| POST   | /api/dev/seed     | Public (dev)  | Seed database              |

All endpoints except auth and dev require a valid JWT in the `Authorization: Bearer <token>` header.

## RBAC Architecture

- **`@Public()`** — decorator to bypass JWT guard on specific routes
- **`@RequirePermissions(...)`** — decorator to specify required permission keys
- **`JwtAuthGuard`** — global guard that verifies JWT and attaches `req.user`
- **`PermissionsGuard`** — checks user's role permissions against route requirements
- **Role Inheritance** — parent org roles automatically cascade to child orgs

All reusable RBAC logic lives in `libs/auth/` and is imported via `@org/auth`.

## Frontend Features

- Login/Register with JWT authentication
- Kanban board with drag-and-drop (status changes)
- Task CRUD with modal form
- Search, category filter, and sort controls
- Organization selector (multi-org support)
- Responsive design (mobile to desktop)
- Signal-based state management

## Shared Libraries

### `@org/data`
Shared TypeScript interfaces used by both frontend and backend:
`User`, `Task`, `Organization`, `AuthResponse`, `TaskStatus`, `TASK_STATUSES`, `CATEGORIES`, `CreateTaskDto`, `UpdateTaskDto`

### `@org/auth`
Reusable NestJS RBAC primitives:
`Public`, `RequirePermissions`, `JwtAuthGuard`, `PermissionsGuard`

## Useful Commands

```bash
# Build API
npx nx build @org/api

# Build Dashboard
npx nx build dashboard

# Run tests
npx nx test @org/api
npx nx test dashboard

# Lint
npx nx lint @org/api
npx nx lint dashboard

# Visualize dependency graph
npx nx graph
```
