import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          Bookit
        </Link>
        <nav>
          {isLoggedIn ? (
            <>
              <Link to="/organizer">Dashboard</Link>
              <button type="button" className="link-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login">Organizer login</Link>
          )}
        </nav>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <p>Bookit – simple community event registration</p>
      </footer>
    </div>
  );
}
