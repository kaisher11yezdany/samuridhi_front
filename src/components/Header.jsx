import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const TITLES = {
  '/dashboard':     ['Executive Dashboard',    'Welcome back, let\'s get to work.'],
  '/notifications': ['Notifications',          'Your latest alerts and updates'],
  '/customers':     ['Customer Management',    'All registered customers'],
  '/projects':      ['Project Management',     'Track projects end to end'],
  '/elevators':     ['Digital Elevator Assets','Full elevator registry'],
  '/installation':  ['Installation Management','Active installation progress'],
  '/maintenance':   ['Preventive Maintenance', 'Scheduled service records'],
  '/breakdown':     ['Breakdown Service',      'Emergency response tracking'],
  '/technicians':   ['Technician Management',  'Field team overview'],
  '/sites':         ['Site Management',        'All project locations'],
  '/testing':       ['Testing & Commissioning','Commissioning records'],
  '/warranty':      ['Warranty & AMC',         'Contract management'],
  '/spareparts':    ['Spare Parts',            'Inventory tracking'],
  '/reports':       ['Reports & Analytics',    'Insights and summaries'],
  '/settings':      ['System Settings',        'Configure your workspace'],
  '/survey':        ['Survey & Inspection',    'Pre-installation surveys'],
  '/procurement':   ['Procurement',            'Purchase orders and vendors'],
  '/qa':            ['QA & Commissioning',     'Quality assurance records'],
  '/handover':      ['Handover Management',    'Completion and handovers'],
  '/documents':     ['Document Management',   'Files and certificates'],
  '/approvals':     ['Approval Workflows',     'Pending and completed approvals'],
  '/auditlogs':     ['Audit Logs',             'Security and activity trail'],
};

export default function Header() {
  const { user, logout, unreadCount } = useAuth();
  const { pathname }   = useLocation();
  const navigate       = useNavigate();
  const [query, setQuery] = useState('');

  const [title, subtitle] = TITLES[pathname] || ['Dashboard', ''];
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="header">
      {/* Left: page title */}
      <div className="header-left">
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div className="header-subtitle">{subtitle}</div>}
        </div>
      </div>

      {/* Center: search */}
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search dashboard…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Right: bell + user + logout */}
      <div className="header-right">
        <div className="notification-icon" onClick={() => navigate('/notifications')}>
          <span className="notification-bell">🔔</span>
          {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
        </div>

        <div className="user-profile">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {user?.name || 'Admin User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              {user?.role || 'Super Admin'}
            </div>
          </div>
          <div className="avatar">{initials}</div>
        </div>

        <button className="logout-button" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
