# Bookit – Event Registration System

Student MVP for community event registration (Track 06).

## Architecture

```
Frontend (React + Vite)  →  Backend API (Node.js + Express)  →  Supabase PostgreSQL
```

- **Frontend**: Deployed to Vercel (planned)
- **Backend**: Deployed to Render (planned)
- **Database**: Supabase PostgreSQL (project already provisioned)

This repository currently contains only the project foundation. No business features, database schema, or API endpoints have been implemented yet.

## Project Structure

```
Bookit/
├── frontend/                 # React + Vite + TypeScript SPA
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   └── index.ts          # Minimal server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Local Development

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in values later
npm run dev
```
Runs on http://localhost:3000 (or the PORT defined in .env)

## Intended Next Steps (not implemented yet)
1. Database schema (events, attendees, registrations) in Supabase
2. Backend API routes for event creation, public registration, capacity checks, and roster
3. Frontend pages: organizer event form, public sign-up page, organizer dashboard
4. Basic authentication for the organizer dashboard
5. Deployment configuration

## Scope Notes
- MVP only – features strictly limited to the approved PRD
- No email confirmations, CSV export, or other nice-to-have features
- Keep the implementation simple and suitable for a student software-engineering project
