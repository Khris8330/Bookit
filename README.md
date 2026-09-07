# Bookit – Event Registration System

Student MVP for community event registration (Track 06).

## Architecture

```
Frontend (React + Vite)  →  Backend API (Node.js + Express)  →  Supabase PostgreSQL
```

- **Frontend**: Deployed to Vercel (planned)
- **Backend**: Deployed to Render (planned)
- **Database**: Supabase PostgreSQL (project already provisioned)

## Project Structure

```
Bookit/
├── frontend/                 # React + Vite + TypeScript SPA
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── index.ts          # API routes + server
│   │   └── lib/
│   │       └── supabase.ts   # Supabase client
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Backend API (STEP 3)

| Method | Endpoint                  | Purpose                                      |
|--------|---------------------------|----------------------------------------------|
| GET    | `/health`                 | Health check                                 |
| POST   | `/events`                 | Create event (organizer)                     |
| GET    | `/events/:id`             | Public event details + capacity info         |
| POST   | `/events/:id/register`    | Public attendee registration                 |
| GET    | `/events/:id/roster`      | Organizer roster (sorted by registered_at)   |

### Capacity & Concurrency
Registration is handled by a PostgreSQL function `register_for_event` that:
- Locks the event row with `SELECT … FOR UPDATE`
- Upserts the attendee by email
- Checks for an existing registration (duplicate prevention)
- Counts current registrations under the lock
- Inserts only if capacity remains

This prevents race conditions where concurrent requests could exceed `max_capacity`.

### Error codes
- `INVALID_INPUT` (400)
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
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
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
- No email confirmations, CSV export, or other nice-to-have features
- Keep the implementation simple and suitable for a student software-engineering project
