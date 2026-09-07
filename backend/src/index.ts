import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './lib/supabase.js';
import { requireOrganizer, AuthRequest } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: always allow local Vite dev server; also allow the production frontend when set.
const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// ---------- Validation schemas ----------

const createEventSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().optional().nullable(),
  event_date: z.string().datetime({ offset: true }).or(z.string().datetime()),
  location: z.string().trim().min(1),
  max_capacity: z.number().int().min(1),
});

const registerSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  email: z.string().trim().email(),
});

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// ---------- Helpers ----------

function sendError(
  res: Response,
  status: number,
  code: string,
  message: string
) {
  return res.status(status).json({ error: { code, message } });
}

// ---------- Auth routes ----------

/**
 * POST /auth/login
 * Organizer login. Returns a JWT for protected routes.
 */
app.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'INVALID_INPUT', 'Username and password are required');
    }

    const { username, password } = parsed.data;

    const expectedUsername = process.env.ORGANIZER_USERNAME;
    const passwordHash = process.env.ORGANIZER_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!expectedUsername || !passwordHash || !jwtSecret) {
      console.error('Organizer auth env vars are not fully configured');
      return sendError(res, 500, 'SERVER_ERROR', 'Authentication is not configured');
    }

    if (username !== expectedUsername) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign({ username }, jwtSecret, { expiresIn } as jwt.SignOptions);

    res.json({
      token,
      token_type: 'Bearer',
      expires_in: expiresIn,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Public routes ----------

/** Health check */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bookit-backend' });
});

/**
 * GET /events/:id
 * Public event details + capacity info for the registration page.
 */
app.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return sendError(res, 400, 'INVALID_INPUT', 'Invalid event id');
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, description, event_date, location, max_capacity')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return sendError(res, 404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    if (countError) {
      console.error('Count error:', countError);
      return sendError(res, 500, 'DATABASE_ERROR', 'Failed to fetch registration count');
    }

    const registeredCount = count ?? 0;
    const isFull = registeredCount >= event.max_capacity;

    res.json({
      event: {
        ...event,
        registered_count: registeredCount,
        spots_remaining: Math.max(0, event.max_capacity - registeredCount),
        is_full: isFull,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /events/:id/register
 * Public registration. Capacity and duplicates are enforced inside a
 * database function that locks the event row (FOR UPDATE).
 */
app.post('/events/:id/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = String(req.params.id);

    if (!/^[0-9a-f-]{36}$/i.test(eventId)) {
      return sendError(res, 400, 'INVALID_INPUT', 'Invalid event id');
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'INVALID_INPUT', parsed.error.errors.map(e => e.message).join('; '));
    }

    const { first_name, last_name, email } = parsed.data;

    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id: eventId,
      p_first_name: first_name,
      p_last_name: last_name,
      p_email: email,
    });

    if (error) {
      const msg = error.message || '';

      if (msg.includes('EVENT_NOT_FOUND')) {
        return sendError(res, 404, 'EVENT_NOT_FOUND', 'Event not found');
      }
      if (msg.includes('DUPLICATE_REGISTRATION')) {
        return sendError(res, 409, 'DUPLICATE_REGISTRATION', 'You are already registered for this event');
      }
      if (msg.includes('EVENT_FULL')) {
        return sendError(res, 409, 'EVENT_FULL', 'This event has reached its maximum capacity');
      }

      console.error('Registration error:', error);
      return sendError(res, 500, 'DATABASE_ERROR', 'Registration failed');
    }

    res.status(201).json({
      message: 'Registration successful',
      registration: data,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Protected organizer routes ----------

/**
 * POST /events
 * Create a new event (organizer only).
 */
app.post('/events', requireOrganizer, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'INVALID_INPUT', parsed.error.errors.map(e => e.message).join('; '));
    }

    const { title, description, event_date, location, max_capacity } = parsed.data;

    const eventDate = new Date(event_date);
    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return sendError(res, 400, 'INVALID_INPUT', 'event_date must be a future date');
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description ?? null,
        event_date: eventDate.toISOString(),
        location,
        max_capacity,
      })
      .select('id, title, description, event_date, location, max_capacity, created_at')
      .single();

    if (error) {
      console.error('Create event error:', error);
      return sendError(res, 500, 'DATABASE_ERROR', 'Failed to create event');
    }

    res.status(201).json({
      event: data,
      public_registration_path: `/register/${data.id}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /events/:id/roster
 * Organizer view: list of registered attendees ordered by registered_at ASC.
 */
app.get('/events/:id/roster', requireOrganizer, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return sendError(res, 400, 'INVALID_INPUT', 'Invalid event id');
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, max_capacity')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return sendError(res, 404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    const { data: roster, error: rosterError } = await supabase
      .from('registrations')
      .select(`
        id,
        registered_at,
        attendees (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_id', id)
      .order('registered_at', { ascending: true });

    if (rosterError) {
      console.error('Roster error:', rosterError);
      return sendError(res, 500, 'DATABASE_ERROR', 'Failed to fetch roster');
    }

    res.json({
      event: {
        id: event.id,
        title: event.title,
        max_capacity: event.max_capacity,
      },
      registrations: (roster ?? []).map((r: any) => ({
        registration_id: r.id,
        registered_at: r.registered_at,
        attendee: r.attendees,
      })),
      total_registered: roster?.length ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Global error handler ----------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'SERVER_ERROR', 'An unexpected error occurred');
});

app.listen(PORT, () => {
  console.log(`Bookit backend listening on port ${PORT}`);
});
