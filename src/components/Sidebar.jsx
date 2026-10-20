import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: 'Super Admin' | 'Management' | 'Project Manager' | 'Technician'
const NAV = [
  { section: 'Menu', roles: ['Super Admin','Management','Project Manager','Technician'] },
  { to: '/dashboard',      icon: '📊', label: 'Dashboard',             roles: ['Super Admin','Management','Project Manager','Technician'] },
  { to: '/notifications',  icon: '🔔', label: 'Notifications',         roles: ['Super Admin','Management','Project Manager','Technician'] },
  { section: 'Customer & Projects', roles: ['Super Admin','Management','Project Manager'] },
  { to: '/customers',      icon: '👥', label: 'Customers',             roles: ['Super Admin','Management','Project Manager'] },
  { to: '/projects',       icon: '📁', label: 'Projects',              roles: ['Super Admin','Management','Project Manager'] },
  { to: '/sites',          icon: '🏢', label: 'Sites',                 roles: ['Super Admin','Management','Project Manager'] },
  { section: 'Operations', roles: ['Super Admin','Management','Project Manager'] },
  { to: '/survey',         icon: '🔍', label: 'Survey & Inspection',   roles: ['Super Admin','Management','Project Manager'] },
  { to: '/installation',   icon: '🔨', label: 'Installation',          roles: ['Super Admin','Management','Project Manager'] },
  { to: '/procurement',    icon: '🛒', label: 'Procurement',           roles: ['Super Admin','Management','Project Manager'] },
  { to: '/qa',             icon: '✅', label: 'QA & Commissioning',    roles: ['Super Admin','Management','Project Manager'] },
  { to: '/handover',       icon: '🤝', label: 'Handover',              roles: ['Super Admin','Management','Project Manager'] },
  { section: 'Asset Management', roles: ['Super Admin','Management','Project Manager','Technician'] },
  { to: '/elevators',      icon: '🛗', label: 'Elevators',             roles: ['Super Admin','Management','Project Manager'] },
  { to: '/maintenance',    icon: '🔧', label: 'Maintenance',           roles: ['Super Admin','Management','Project Manager','Technician'] },
  { to: '/breakdown',      icon: '🆘', label: 'Breakdown Service',     roles: ['Super Admin','Management','Project Manager','Technician'] },
  { to: '/technicians',    icon: '👨‍🔧', label: 'Technicians',           roles: ['Super Admin','Management'] },
  { section: 'Service', roles: ['Super Admin','Management','Project Manager'] },
  { to: '/testing',        icon: '📝', label: 'Testing & Commission',  roles: ['Super Admin','Management','Project Manager'] },
  { to: '/warranty',       icon: '📋', label: 'Warranty & AMC',        roles: ['Super Admin','Management','Project Manager'] },
  { to: '/spareparts',     icon: '📦', label: 'Spare Parts',           roles: ['Super Admin','Management','Project Manager','Technician'] },
  { section: 'Management', roles: ['Super Admin','Management'] },
  { to: '/documents',      icon: '📂', label: 'Documents',             roles: ['Super Admin','Management','Project Manager'] },
  { to: '/approvals',      icon: '✔️',  label: 'Approvals',             roles: ['Super Admin','Management'] },
  { to: '/reports',        icon: '📈', label: 'Reports & Analytics',   roles: ['Super Admin','Management'] },
  { to: '/auditlogs',      icon: '🛡️',  label: 'Audit Logs',            roles: ['Super Admin'] },
  { section: 'Settings & More', roles: ['Super Admin'] },
  { to: '/settings',       icon: '⚙️',  label: 'Settings',              roles: ['Super Admin'] },
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
        {NAV.filter(item => item.roles?.includes(user?.role)).map((item, i) => {
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
