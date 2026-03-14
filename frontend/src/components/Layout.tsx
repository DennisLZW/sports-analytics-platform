import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `layout-nav-link${isActive ? ' active' : ''}`;

  return (
    <>
      <header className="layout-header">
        <nav className="layout-nav" aria-label="Main navigation">
          <Link to="/" className="layout-brand">
            Sports Analytics
          </Link>
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/matches" className={navLinkClass}>
            Matches
          </NavLink>
          {user ? (
            <>
              <NavLink to="/watchlist" className={navLinkClass}>
                Watchlist
              </NavLink>
              <NavLink to="/predictions" className={navLinkClass}>
                My Predictions
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="nav-logout"
                aria-label="Log out"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </>
  );
}
