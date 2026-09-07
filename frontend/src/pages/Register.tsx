import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, registerForEvent } from '../api';
import Alert from '../components/Alert';

export default function Register() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    getEvent(eventId)
      .then((data) => setEvent(data.event))
      .catch((err) => setLoadError(err.message || 'Event not found'))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!eventId || !event) return;

    setFormError('');
    setSubmitting(true);

    try {
      await registerForEvent(eventId, {
        first_name: firstName,
        last_name: lastName,
        email,
      });
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'EVENT_FULL') {
        // Refresh event state so UI shows full
        setEvent((prev: any) => (prev ? { ...prev, is_full: true, spots_remaining: 0 } : prev));
        setFormError('This event is full. Registration is closed.');
      } else if (err.code === 'DUPLICATE_REGISTRATION') {
        setFormError('You are already registered for this event.');
      } else {
        setFormError(err.message || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <p>Loading event…</p>
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="card">
        <Alert type="error">{loadError || 'Event not found'}</Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card narrow">
        <Alert type="success">
          <strong>You're registered!</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Thanks, {firstName}. Your spot for <em>{event.title}</em> has been
            reserved.
          </p>
        </Alert>
      </div>
    );
  }

  const isFull = event.is_full;

  return (
    <div className="card">
      <h1>{event.title}</h1>

      {event.description && <p className="description">{event.description}</p>}

      <ul className="event-meta">
        <li>
          <strong>When:</strong>{' '}
          {new Date(event.event_date).toLocaleString()}
        </li>
        <li>
          <strong>Where:</strong> {event.location}
        </li>
        <li>
          <strong>Capacity:</strong>{' '}
          {event.registered_count} / {event.max_capacity}
          {event.spots_remaining > 0 && (
            <span className="spots"> ({event.spots_remaining} spots left)</span>
          )}
        </li>
      </ul>

      {isFull ? (
        <Alert type="warning">
          <strong>Event Full</strong>
          <p style={{ marginTop: '0.35rem' }}>
            This event has reached its maximum capacity. Registration is closed.
          </p>
        </Alert>
      ) : (
        <>
          {formError && <Alert type="error">{formError}</Alert>}

          <form onSubmit={handleSubmit} className="form">
            <label>
              First name <span className="req">*</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </label>

            <label>
              Last name <span className="req">*</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </label>

            <label>
              Email <span className="req">*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isFull}
            >
              {submitting ? 'Registering…' : 'Register'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
