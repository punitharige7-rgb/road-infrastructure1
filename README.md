# Road Infrastructure Care — Road Issue Ticket Management

This project contains two separate React/Vite frontends and a Spring Boot + MySQL REST API:

- `user-frontend/` — citizen registration/login demo, issue submission, ticket history and status tracking.
- `admin-frontend/` — admin demo login, ticket overview, assignment, priority and status management.
- `road-infrastructure-backend/` — REST API and JPA persistence.

## Requirements

- Java 17 or newer
- Maven 3.9+
- Node.js 20+ and npm
- MySQL 8+

## 1. Configure MySQL

Create the database (or let the JDBC URL create it automatically):

```sql
CREATE DATABASE road_infrastructure;
```

The backend reads settings from environment variables. Defaults are in
`road-infrastructure-backend/src/main/resources/application.properties`:

- `DB_URL` defaults to `jdbc:mysql://localhost:3306/road_infrastructure?...`
- `DB_USERNAME` defaults to `root`
- `DB_PASSWORD` defaults to `CHANGE_ME`

Set `DB_PASSWORD` to your local MySQL password before starting the backend. Do not commit real credentials.

## 2. Start the backend

Open a terminal:

```bash
cd road-infrastructure-backend
mvn spring-boot:run
```

API base URL: `http://localhost:8081`

Health check: `http://localhost:8081/api/health` (if the health controller is enabled).
Ticket API: `http://localhost:8081/api/tickets`

## 3. Start the citizen portal

In a second terminal:

```bash
cd user-frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## 4. Start the admin console

In a third terminal:

```bash
cd admin-frontend
npm install
npm run dev
```

Open `http://localhost:5174`.

## Included ticket workflow

`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`

Ticket fields include title, description, category, location, reporter name/email/phone, priority, assigned staff, status, and timestamps. A successful create response includes the ticket ID, which is shown as the tracking number in the citizen portal.

## Demo admin credentials

- Email: `admin@roadinfra.in`
- Password: `Admin@123`

Change these before any demonstration where other people can access the machine.

## Important security note — before public use

This ZIP is a working **development/demo starter**, not a production-secure application. In this version, citizen accounts and their passwords are stored in browser local storage, and the admin login is checked in frontend code. The backend ticket endpoints do not yet enforce server-side authentication, roles, or ticket ownership. Therefore a user could bypass the UI and call the API directly. Do not use real passwords or sensitive personal data and do not expose this API to the internet until server-side authentication (password hashing, secure sessions/JWT), role-based endpoint authorization, per-user ticket ownership checks, validation, rate limiting, and HTTPS are implemented and tested.

## Separate GitHub repositories

To publish the components separately, create three repositories and copy only the corresponding folder into each:

1. `road-infrastructure-user-frontend` ← `user-frontend/`
2. `road-infrastructure-admin-frontend` ← `admin-frontend/`
3. `road-infrastructure-backend` ← `road-infrastructure-backend/`

Each frontend currently points at `http://localhost:8081/api/tickets`; configure an environment-based API URL before deployment.
