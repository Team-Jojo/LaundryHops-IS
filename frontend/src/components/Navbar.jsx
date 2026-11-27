import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="material-symbols-rounded">local_laundry_service</span>
        Laundry<span className="brand-accent">Hops</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>
          Services
        </NavLink>
        {user && <NavLink to="/my-bookings">My Bookings</NavLink>}
        {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
        {isAdmin && <NavLink to="/admin/bookings">Bookings</NavLink>}
        {isAdmin && <NavLink to="/admin/services">Services</NavLink>}
        {isAdmin && <NavLink to="/admin/payments">Payments</NavLink>}
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <span className="user-chip">
              Hi, {user.full_name.split(' ')[0]}
              {isAdmin && <span className="chip-role">admin</span>}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost btn-sm" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary btn-sm" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
