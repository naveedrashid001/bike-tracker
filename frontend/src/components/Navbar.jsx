import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="brand">
        🏍️ Bike Tracker
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-user">assalamu alaikum, {user.name}</span>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
                <Link to="/admin/link-tracker">Link Tracker</Link>
              </>
            )}
            <button type="button" className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}