# Bookit – Event Registration System

Student MVP for community event registration (Track 06).

## Architecture

```
Frontend (React + Vite)  →  Backend API (Node.js + Express)  →  Supabase PostgreSQL
```

- **Frontend**: Deployed to Vercel (planned)
- **Backend**: Deployed to Render (planned)
- **Database**: Supabase PostgreSQL (project already provisioned)

## Backend API

| Method | Endpoint                  | Auth required | Purpose                                    |
|--------|---------------------------|---------------|--------------------------------------------|
| GET    | `/health`                 | No            | Health check                               |
| POST   | `/auth/login`             | No            | Organizer login → returns JWT              |
| GET    | `/events/:id`             | No            | Public event details + capacity info       |
| POST   | `/events/:id/register`    | No            | Public attendee registration               |
| POST   | `/events`                 | Yes (JWT)     | Create event (organizer)                   |
| GET    | `/events/:id/roster`      | Yes (JWT)     | Organizer roster (sorted by registered_at) |

### Authentication (STEP 4)
Simple single-organizer JWT authentication:
- Credentials stored as environment variables (`ORGANIZER_USERNAME` + bcrypt `ORGANIZER_PASSWORD_HASH`)
- `POST /auth/login` verifies password and returns a signed JWT
- Protected routes require `Authorization: Bearer <token>`
- Public registration remains completely account-free

Generate a password hash:
```bash
cd backend
npm run hash-password
```

### Capacity & Concurrency
Registration uses a PostgreSQL function with `SELECT … FOR UPDATE` so concurrent requests cannot exceed `max_capacity`.

### Error codes
- `INVALID_INPUT` (400)
- `UNAUTHORIZED` (401)
- `EVENT_NOT_FOUND` (404)
- `DUPLICATE_REGISTRATION` (409)
- `EVENT_FULL` (409)
- `DATABASE_ERROR` / `SERVER_ERROR` (500)

## Local Development

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_*, ORGANIZER_*, and JWT_SECRET
npm run hash-password   # generate ORGANIZER_PASSWORD_HASH
npm run dev
```
Runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## Scope Notes
- MVP only – features strictly limited to the approved PRD
- No email confirmations, CSV export, attendee accounts, or multi-role systems
- Keep the implementation simple and suitable for a student software-engineering project
