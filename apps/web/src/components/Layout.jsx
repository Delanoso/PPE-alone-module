import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../services/auth';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/people', label: 'People' },
  { to: '/departments', label: 'Departments' },
  { to: '/issuing', label: 'Issue PPE' },
  { to: '/issued', label: 'All Issued PPE' },
  { to: '/reminders', label: 'Reminders' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">PPE</h1>
          <span className="logo-sub">PPE Management</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.full_name}</span>
            <span className="user-role">{user?.roles?.[0]?.name}</span>
          </div>
          <button type="button" className="btn-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
