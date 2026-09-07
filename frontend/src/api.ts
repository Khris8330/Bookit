const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as ApiError;
    throw {
      status: res.status,
      code: err?.error?.code || 'UNKNOWN',
      message: err?.error?.message || 'Something went wrong',
    };
  }

  return data as T;
}

export function getToken(): string | null {
  return localStorage.getItem('bookit_token');
}

export function setToken(token: string) {
  localStorage.setItem('bookit_token', token);
}

export function clearToken() {
  localStorage.removeItem('bookit_token');
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------- Public ----------

export async function getEvent(id: string) {
  return request<{ event: any }>(`/events/${id}`);
}

export async function registerForEvent(
  eventId: string,
  body: { first_name: string; last_name: string; email: string }
) {
  return request(`/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------- Auth ----------

export async function login(username: string, password: string) {
  return request<{ token: string; token_type: string; expires_in: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }
  );
}

// ---------- Organizer ----------

export async function createEvent(body: {
  title: string;
  description?: string;
  event_date: string;
  location: string;
  max_capacity: number;
}) {
  return request<{ event: any; public_registration_path: string }>('/events', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function getRoster(eventId: string) {
  return request<{ event: any; registrations: any[]; total_registered: number }>(
    `/events/${eventId}/roster`,
    { headers: authHeaders() }
  );
}
