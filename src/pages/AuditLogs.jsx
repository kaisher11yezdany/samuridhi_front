import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import { getAuditLogs } from '../api/api';

const SEV_COLORS = {
  Info:     { bg:'#e8f5e9', color:'#1baf7a' },
  Warning:  { bg:'#fff3e0', color:'#eda100' },
  Critical: { bg:'#fdecea', color:'#e34948' },
};

const SEVERITIES = ['All','Info','Warning','Critical'];

const fmtTime = ts => {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
};

export default function AuditLogs() {
  const [logs, setLogs]         = useState([]);
  const [module, setModule]     = useState('All');
  const [severity, setSeverity] = useState('All');
  const [search, setSearch]     = useState('');
  const [modules, setModules]   = useState(['All']);

  useEffect(() => {
    getAuditLogs().then(r => {
      setLogs(r.data);
      const mods = ['All', ...new Set(r.data.map(l => l.module).filter(Boolean))];
      setModules(mods);
    }).catch(() => {});
  }, []);

  const filtered = logs.filter(l =>
    (module === 'All' || l.module === module) &&
    (severity === 'All' || l.severity === severity) &&
    (search === '' || (l.user || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.target || '').toLowerCase().includes(search.toLowerCase()))
  );

  const critical = logs.filter(l => l.severity === 'Critical').length;
  const warnings = logs.filter(l => l.severity === 'Warning').length;
  const infos    = logs.filter(l => l.severity === 'Info').length;

  const exportCSV = () => {
    const header = 'Timestamp,User,Role,Action,Module,Target,IP,Severity\n';
    const rows = filtered.map(l => [fmtTime(l.createdAt),l.user,l.role,l.action,l.module,l.target,l.ip,l.severity].join(',')).join('\n');
    const blob = new Blob([header + rows], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit_logs.csv'; a.click();
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total Events" value={logs.length} subtitle="Activity log entries" />
        <Widget title="Critical"     value={critical}    subtitle="High severity events"  type="danger" />
        <Widget title="Warnings"     value={warnings}    subtitle="Medium severity"        type="warning" />
        <Widget title="Info Events"  value={infos}       subtitle="Normal activity"        type="success" />
      </div>

      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'1rem', alignItems:'center' }}>
        <input type="text" placeholder="Search user, action, target..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'0.5rem 0.75rem', border:'1px solid #ddd', borderRadius:'6px', flex:1, minWidth:'200px' }} />
        <select value={module} onChange={e => setModule(e.target.value)}
          style={{ padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)}
          style={{ padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
          {SEVERITIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-primary" style={{ whiteSpace:'nowrap' }} onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th><th>User</th><th>Role</th><th>Action</th>
              <th>Module</th><th>Target</th><th>IP Address</th><th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0
              ? filtered.map(log => {
                const sev = SEV_COLORS[log.severity] || {};
                return (
                  <tr key={log._id} style={{ borderLeft: log.severity === 'Critical' ? '3px solid #e34948' : log.severity === 'Warning' ? '3px solid #eda100' : '3px solid transparent' }}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'#555', whiteSpace:'nowrap' }}>{fmtTime(log.createdAt)}</td>
                    <td><strong>{log.user || '-'}</strong></td>
                    <td style={{ fontSize:'0.82rem', color:'#666' }}>{log.role || '-'}</td>
                    <td>{log.action}</td>
                    <td style={{ fontSize:'0.82rem', color:'#1e3a5f' }}>{log.module || '-'}</td>
                    <td style={{ maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'0.82rem', color:'#666' }}>{log.target || '-'}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'#888' }}>{log.ip || '-'}</td>
                    <td>
                      <span style={{ background:sev.bg, color:sev.color, borderRadius:'12px', padding:'2px 8px', fontSize:'0.8rem', fontWeight:600 }}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                );
              })
              : <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No logs found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </>
  );
}
