import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { section: 'Menu' },
  { to: '/dashboard',      icon: '📊', label: 'Dashboard' },
  { to: '/notifications',  icon: '🔔', label: 'Notifications' },
  { section: 'Customer & Projects' },
  { to: '/customers',      icon: '👥', label: 'Customers' },
  { to: '/projects',       icon: '📁', label: 'Projects' },
  { to: '/sites',          icon: '🏢', label: 'Sites' },
  { section: 'Operations' },
  { to: '/survey',         icon: '🔍', label: 'Survey & Inspection' },
  { to: '/installation',   icon: '🔨', label: 'Installation' },
  { to: '/procurement',    icon: '🛒', label: 'Procurement' },
  { to: '/qa',             icon: '✅', label: 'QA & Commissioning' },
  { to: '/handover',       icon: '🤝', label: 'Handover' },
  { section: 'Asset Management' },
  { to: '/elevators',      icon: '🛗', label: 'Elevators' },
  { to: '/maintenance',    icon: '🔧', label: 'Maintenance' },
  { to: '/breakdown',      icon: '🆘', label: 'Breakdown Service' },
  { to: '/technicians',    icon: '👨‍🔧', label: 'Technicians' },
  { section: 'Service' },
  { to: '/testing',        icon: '📝', label: 'Testing & Commission' },
  { to: '/warranty',       icon: '📋', label: 'Warranty & AMC' },
  { to: '/spareparts',     icon: '📦', label: 'Spare Parts' },
  { section: 'Management' },
  { to: '/documents',      icon: '📂', label: 'Documents' },
  { to: '/approvals',      icon: '✔️',  label: 'Approvals' },
  { to: '/reports',        icon: '📈', label: 'Reports & Analytics' },
  { to: '/auditlogs',      icon: '🛡️',  label: 'Audit Logs' },
  { section: 'Settings & More' },
  { to: '/settings',       icon: '⚙️',  label: 'Settings' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo-img">
        <img src="/samrudhya_elevator_logo.png" alt="Samrudhya Elevators"
          onError={e => { e.target.style.display = 'none'; }} />
      </div>

      {/* Brand + company */}
      <div style={{ padding: '0.5rem 1.25rem 0' }}>
        <div className="sidebar-brand">Samrudhya Elevators</div>
      </div>
      <div className="sidebar-company">
        <select defaultValue="samrudhya">
          <option value="samrudhya">Samrudhya Elevators</option>
        </select>
      </div>

      {/* User profile */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid #f5f5f5',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.88rem', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e3a5f', lineHeight: 1.2 }}>
            {user?.name || 'Admin User'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
            {user?.role || 'Super Admin'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ul className="nav-menu">
        {NAV.map((item, i) => {
          if (item.section) {
            return (
              <li key={`s-${i}`} className="nav-section-label">
                {item.section}
              </li>
            );
          }
          return (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '1rem', width: 22, textAlign: 'center', display: 'inline-block' }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
