import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getDashboard } from '../api/api';

const DEFAULT = {
  totalCustomers: 0, totalSites: 0, totalProjects: 0,
  activeProjects: 0, delayedProjects: 0,
  totalElevators: 0, operationalElevators: 0,
  underMaintenance: 0, breakdownElevators: 0,
  activeAMC: 0, openTickets: 0, criticalIssues: 0,
  recentTickets: [], monthlyProjects: [],
  ticketTrend: [], elevatorStatus: [], monthlyRevenue: [],
};

const PIE_COLORS = ['#059669', '#d97706', '#dc2626', '#7c3aed'];

// Merge monthly data arrays by "month" key
function mergeByMonth(a, b, bKeys) {
  const map = {};
  (a || []).forEach(item => { map[item.month] = { ...item }; });
  (b || []).forEach(item => {
    if (!map[item.month]) map[item.month] = { month: item.month };
    bKeys.forEach(k => { map[item.month][k] = item[k]; });
  });
  return Object.values(map);
}

const Card = ({ children, style }) => (
  <div className="dash-card" style={style}>{children}</div>
);

const MiniStat = ({ label, value, color = '#1e3a5f', bg = '#eef2ff' }) => (
  <div style={{ background: bg, borderRadius: 14, padding: '1rem 1.25rem' }}>
    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>
      {value}
    </div>
  </div>
);

const CustomerRow = ({ ticket }) => {
  const initials = (ticket.customer || '?')[0].toUpperCase();
  const avatarColors = ['#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7'];
  const txtColors    = ['#2563eb', '#db2777', '#059669', '#d97706'];
  const idx = initials.charCodeAt(0) % 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderBottom: '1px solid #f5f7fb' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: avatarColors[idx],
        color: txtColors[idx],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e3a5f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.customer}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
          {ticket.ticketId}  ·  {ticket.priority || 'Normal'}
        </div>
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        border: '1.5px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer',
        flexShrink: 0,
      }}>
        ✉
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData]       = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setData({ ...DEFAULT, ...r.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pct = data.totalElevators > 0
    ? Math.round((data.operationalElevators / data.totalElevators) * 100)
    : 0;

  const totalRevenue = (data.monthlyRevenue || []).reduce((s, m) => s + (m.revenue || 0), 0);
  const chartData = mergeByMonth(data.monthlyRevenue, data.monthlyProjects, ['completed', 'new']);

  return (
    <>
      {/* ── Top KPI Cards ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <Widget title="Total Customers"  value={data.totalCustomers}  subtitle="Active organizations" icon="👥" />
        <Widget title="System Health"    value={`${pct}%`}            subtitle="Elevators operational" icon="🛡️" type="success" />
        <Widget title="Total Elevators"  value={data.totalElevators}  subtitle="All installed units"  icon="🛗" />
        <Widget title="Active Projects"  value={data.activeProjects}  subtitle="In execution"         icon="📁" type="warning" />
        <Widget title="Open Tickets"     value={data.openTickets}     subtitle="Service requests"     icon="🆘" type="danger" />
        <Widget title="Active AMC"       value={data.activeAMC}       subtitle="Contracts"            icon="📋" />
      </div>

      {!loading && (
        <>
          {/* ── Main two-col section ─────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'start' }}>

            {/* Left: summary row + combo chart */}
            <Card>
              {/* Summary numbers */}
              <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e3a5f' }}>₹{totalRevenue}L</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Period</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e3a5f' }}>12 Mo</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Projects</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e3a5f' }}>{data.activeProjects}</div>
                </div>
              </div>

              {/* Combo chart: orange bars (revenue) + navy line (projects) */}
              <ResponsiveContainer width="100%" height={210}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '0.8rem' }}
                    cursor={{ fill: 'rgba(238,242,255,0.4)' }}
                  />
                  <Bar dataKey="revenue"   name="Revenue (L)"  fill="#FF6B35" radius={[6,6,0,0]} maxBarSize={32} />
                  <Line type="monotone" dataKey="completed" name="Projects"    stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, fill: '#1e3a5f' }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Right: financial breakdown cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <MiniStat label="AMC Contracts"  value={`${data.activeAMC} Active`} color="#7c3aed" bg="#f5f3ff" />
              <MiniStat label="Maintenance Due" value={data.underMaintenance}      color="#d97706" bg="#fffbeb" />
              <MiniStat label="Critical Issues" value={data.criticalIssues}        color="#dc2626" bg="#fef2f2" />
              <MiniStat label="Total Sites"     value={data.totalSites}            color="#059669" bg="#ecfdf5" />
            </div>
          </div>

          {/* ── Bottom two-col section ───────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

            {/* Latest Service Requests */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <div className="dash-card-title" style={{ marginBottom: 0 }}>Latest Service Requests</div>
                <a href="/breakdown" style={{ fontSize: '0.78rem', color: '#FF6B35', textDecoration: 'none', fontWeight: 600 }}>View All</a>
              </div>
              <div>
                {data.recentTickets.length > 0
                  ? data.recentTickets.slice(0, 5).map(t => <CustomerRow key={t._id} ticket={t} />)
                  : (
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                      No service tickets yet
                    </div>
                  )
                }
              </div>
            </Card>

            {/* Elevator Status */}
            <Card>
              <div className="dash-card-title">Elevator Status</div>

              {/* Donut */}
              {(data.elevatorStatus || []).some(e => e.value > 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={data.elevatorStatus}
                        cx="50%" cy="50%"
                        innerRadius={48} outerRadius={72}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        {(data.elevatorStatus || []).map((entry, i) => (
                          <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} units`, n]} contentStyle={{ borderRadius: 10, fontSize: '0.78rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '2px' }}>Operational</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a5f' }}>{pct}%</div>
                    </div>
                    {(data.elevatorStatus || []).map((e, i) => (
                      <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.78rem', color: '#6b7280' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        {e.name}: {e.value}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2.5rem 0' }}>
                  No elevator data yet
                </div>
              )}

              {/* Ticket trend mini-line */}
              {(data.ticketTrend || []).length > 0 && (
                <>
                  <div style={{ borderTop: '1px solid #f5f5f5', marginTop: '1rem', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.6rem' }}>Ticket Trend</div>
                    <ResponsiveContainer width="100%" height={70}>
                      <ComposedChart data={data.ticketTrend} margin={{ top: 0, right: 5, left: -30, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#c0c8d8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: '0.75rem', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="open"   name="Open"   stroke="#dc2626" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="closed" name="Closed" stroke="#059669" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* ── More KPIs row ────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <Widget title="Total Sites"     value={data.totalSites}        subtitle="Locations"         icon="🏢" />
            <Widget title="Total Projects"  value={data.totalProjects}     subtitle="Since inception"   icon="📊" />
            <Widget title="Delayed"         value={data.delayedProjects}   subtitle="Needs attention"   icon="⚠️" type="warning" />
            <Widget title="Under Maint."    value={data.underMaintenance}  subtitle="Scheduled"         icon="🔧" type="warning" />
            <Widget title="Breakdowns"      value={data.breakdownElevators}subtitle="Requiring repair"  icon="🆘" type="danger" />
            <Widget title="Critical Issues" value={data.criticalIssues}    subtitle="Urgent"            icon="🚨" type="danger" />
          </div>

          {/* ── Recent Tickets Table ─────────────────── */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #f5f5f5', fontWeight: 700, color: '#1e3a5f', fontSize: '0.9rem' }}>
              Recent Service Requests
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Ticket #', 'Customer', 'Complaint', 'Priority', 'Status'].map(h => (
                    <th key={h} style={{ background: '#FAFBFD', padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0f0f0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentTickets.length > 0
                  ? data.recentTickets.map(t => (
                    <tr key={t._id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFBFD'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid #f8f9fb', fontSize: '0.84rem', fontWeight: 600, color: '#1e3a5f' }}>{t.ticketId}</td>
                      <td style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid #f8f9fb', fontSize: '0.84rem', color: '#4b5563' }}>{t.customer}</td>
                      <td style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid #f8f9fb', fontSize: '0.84rem', color: '#4b5563', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.complaint}</td>
                      <td style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid #f8f9fb' }}><StatusBadge text={t.priority} /></td>
                      <td style={{ padding: '0.8rem 1.25rem', borderBottom: '1px solid #f8f9fb' }}><StatusBadge text={t.status} /></td>
                    </tr>
                  ))
                  : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                        No service tickets yet
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </Card>
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '0.95rem' }}>
          Loading dashboard…
        </div>
      )}
    </>
  );
}
