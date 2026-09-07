# Bookit – Event Registration System

Student MVP for community event registration (Track 06).

## Architecture

```
Frontend (React + Vite)  →  Backend API (Node.js + Express)  →  Supabase PostgreSQL
```

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render
- **Database**: Supabase PostgreSQL

## Frontend routes

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

## Local Development

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_*, ORGANIZER_*, JWT_SECRET
npm run hash-password   # generate ORGANIZER_PASSWORD_HASH
npm run dev
```
Runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev
```
Runs on http://localhost:5173

## Production build commands

### Backend
```bash
cd backend
npm install
npm run build          # compiles TypeScript → dist/
npm start              # node dist/index.js  (uses process.env.PORT)
```

### Frontend
```bash
cd frontend
npm install
npm run build          # tsc -b && vite build → dist/
```

## Environment variables

### Backend (set on Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (Render sets this automatically) |
| `FRONTEND_URL` | Yes (prod) | Deployed frontend origin, e.g. `https://your-app.vercel.app` |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key (never expose to frontend) |
| `ORGANIZER_USERNAME` | Yes | Organizer login username |
| `ORGANIZER_PASSWORD_HASH` | Yes | bcrypt hash of the organizer password |
| `JWT_SECRET` | Yes | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `24h`) |

Generate the password hash locally:
```bash
cd backend && npm run hash-password
```

### Frontend (set on Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Deployed backend URL, e.g. `https://bookit-api.onrender.com` |

## Manual deployment checklist

### Render (backend)
1. Create a new **Web Service** from the GitHub repo.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all backend environment variables listed above.
6. Set `FRONTEND_URL` to your Vercel URL once the frontend is deployed.

### Vercel (frontend)
1. Import the GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable `VITE_API_URL` = your Render backend URL.

### After both are live
1. Confirm `FRONTEND_URL` on Render matches the Vercel domain.
2. Confirm `VITE_API_URL` on Vercel matches the Render service URL.
3. Test: login → create event → copy public link → register → view roster.

## Scope Notes
- MVP only – features strictly limited to the approved PRD
- No email confirmations, CSV export, attendee accounts, or multi-role systems
- Keep the implementation simple and suitable for a student software-engineering project
