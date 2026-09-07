import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRoster, getToken } from '../api';
import Alert from '../components/Alert';

export default function Roster() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }

    if (!eventId) return;

    getRoster(eventId)
      .then(setData)
      .catch((err) => {
        if (err.status === 401) {
          navigate('/login');
          return;
        }
        setError(err.message || 'Failed to load roster');
      })
      .finally(() => setLoading(false));
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div className="card">
        <p>Loading roster…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <Alert type="error">{error}</Alert>
        <Link to="/organizer">← Back to dashboard</Link>
      </div>
    );
  }

  if (!data) return null;

  const { event, registrations, total_registered } = data;

  return (
    <div className="card">
      <div className="roster-header">
        <div>
          <h1>{event.title}</h1>
          <p className="muted">
            {total_registered} / {event.max_capacity} registered
          </p>
        </div>
        <Link to="/organizer" className="btn btn-secondary">
          ← Dashboard
        </Link>
      </div>

      {registrations.length === 0 ? (
        <p className="muted">No registrations yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="roster-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Registered at</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r: any, i: number) => (
                <tr key={r.registration_id}>
                  <td>{i + 1}</td>
                  <td>
                    {r.attendee.first_name} {r.attendee.last_name}
                  </td>
                  <td>{r.attendee.email}</td>
                  <td>{new Date(r.registered_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
