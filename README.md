# Bookit – Event Registration System

Student MVP for community event registration (Track 06).

## Architecture

```
Frontend (React + Vite)  →  Backend API (Node.js + Express)  →  Supabase PostgreSQL
```

- **Frontend**: Deployed to Vercel (planned)
- **Backend**: Deployed to Render (planned)
- **Database**: Supabase PostgreSQL (project already provisioned)

## Frontend routes (STEP 5)

| Path                         | Purpose                                      |
|------------------------------|----------------------------------------------|
| `/`                          | Home / landing                               |
| `/login`                     | Organizer login                              |
| `/organizer`                 | Create event + public link                   |
| `/organizer/roster/:eventId` | Organizer roster table                       |
| `/register/:eventId`         | Public registration page (no account needed) |

## Backend API

| Method | Endpoint                  | Auth required | Purpose                                    |
|--------|---------------------------|---------------|--------------------------------------------|
| GET    | `/health`                 | No            | Health check                               |
| POST   | `/auth/login`             | No            | Organizer login → returns JWT              |
| GET    | `/events/:id`             | No            | Public event details + capacity info       |
| POST   | `/events/:id/register`    | No            | Public attendee registration               |
| POST   | `/events`                 | Yes (JWT)     | Create event (organizer)                   |
| GET    | `/events/:id/roster`      | Yes (JWT)     | Organizer roster (sorted by registered_at) |

### Authentication
Simple single-organizer JWT authentication. Public registration remains account-free.

Generate a password hash:
```bash
cd backend && npm run hash-password
```

### Capacity & Concurrency
Registration uses a PostgreSQL function with `SELECT … FOR UPDATE` so concurrent requests cannot exceed `max_capacity`.

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
npm run hash-password
npm run dev
```
Runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:3000
npm run dev
```
Runs on http://localhost:5173

## Scope Notes
- MVP only – features strictly limited to the approved PRD
- No email confirmations, CSV export, attendee accounts, or multi-role systems
- Keep the implementation simple and suitable for a student software-engineering project
