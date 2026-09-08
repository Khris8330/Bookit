import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent, getToken, listEvents } from '../api';
import Alert from '../components/Alert';

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    event: any;
    public_registration_path: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  const loadEvents = useCallback(() => {
    if (!getToken()) return;
    setEventsLoading(true);
    setEventsError('');
    listEvents()
      .then((data) => setEvents(data.events ?? []))
      .catch((err: any) => {
        if (err.status === 401) {
          navigate('/login');
          return;
        }
        setEventsError(err.message || 'Failed to load events');
      })
      .finally(() => setEventsLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    loadEvents();
  }, [navigate, loadEvents]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreated(null);
    setLoading(true);

    try {
      const isoDate = new Date(eventDate).toISOString();

      const data = await createEvent({
        title,
        description: description || undefined,
        event_date: isoDate,
        location,
        max_capacity: Number(maxCapacity),
      });

      setCreated(data);
      setTitle('');
      setDescription('');
      setEventDate('');
      setLocation('');
      setMaxCapacity(20);
      loadEvents();
    } catch (err: any) {
      if (err.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  function publicUrl(path: string) {
    return `${window.location.origin}${path}`;
  }

  async function copyLink() {
    if (!created) return;
    const url = publicUrl(created.public_registration_path);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy this link:', url);
    }
  }

  return (
    <div className="card">
      <h1>Organizer dashboard</h1>
      <p className="muted">Create events and open any roster to monitor registrations.</p>

      {error && <Alert type="error">{error}</Alert>}

      {created && (
        <Alert type="success">
          <strong>Event created!</strong>
          <p style={{ margin: '0.5rem 0' }}>{created.event.title}</p>
          <div className="link-row">
            <code className="public-link">{publicUrl(created.public_registration_path)}</code>
            <button type="button" className="btn btn-secondary" onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <p style={{ marginTop: '0.75rem' }}>
            <Link to={`/organizer/roster/${created.event.id}`}>View roster →</Link>
          </p>
        </Alert>
      )}

      <section className="events-section">
        <h2 className="section-title">Your events</h2>
        {eventsLoading && <p className="muted">Loading events…</p>}
        {eventsError && <Alert type="error">{eventsError}</Alert>}
        {!eventsLoading && !eventsError && events.length === 0 && (
          <p className="muted">No events yet. Create one below.</p>
        )}
        {!eventsLoading && events.length > 0 && (
          <ul className="event-list">
            {events.map((ev) => (
              <li key={ev.id} className="event-list-item">
                <div className="event-list-info">
                  <strong>{ev.title}</strong>
                  <span className="muted">
                    {new Date(ev.event_date).toLocaleString()} · {ev.location}
                  </span>
                  <span className="muted">
                    {ev.registered_count} / {ev.max_capacity} registered
                  </span>
                </div>
                <Link
                  to={`/organizer/roster/${ev.id}`}
                  className="btn btn-secondary"
                >
                  View roster
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="section-title">Create event</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Title <span className="req">*</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={100}
            required
            placeholder="e.g. Community Cleanup Day"
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional details about the event"
          />
        </label>

        <label>
          Date & time <span className="req">*</span>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </label>

        <label>
          Location <span className="req">*</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Community Center, Main Hall"
          />
        </label>

        <label>
          Maximum capacity <span className="req">*</span>
          <input
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            min={1}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create event'}
        </button>
      </form>
    </div>
  );
}
