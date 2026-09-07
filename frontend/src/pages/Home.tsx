import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="card home-card">
      <h1>Bookit</h1>
      <p className="lead">
        Simple event registration for community groups, non-profits, and
        educational chapters.
      </p>
      <div className="home-actions">
        <Link to="/login" className="btn btn-primary">
          Organizer login
        </Link>
      </div>
      <p className="hint">
        Have a registration link? Open it directly to sign up — no account
        needed.
      </p>
    </div>
  );
}
