import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../services/auth';
import './Admin.css';

export default function Admin() {
  const { user, logout } = useAuth();

  if (!user?.is_super_admin) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-header">
          <h1>PPE Admin</h1>
          <span className="admin-badge">Super Admin</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Companies
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Users
          </NavLink>
        </nav>
        <div className="admin-footer">
          <span className="admin-user">{user?.email}</span>
          <button type="button" className="btn-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
