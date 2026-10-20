import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getReportsSummary } from '../api/api';

const DEFAULT = { projectPerf:[], techPerf:[], totalProjects:0, totalBreakdowns:0, totalTechnicians:0, totalElevators:0, totalCustomers:0, activeAMC:0 };

export default function Reports() {
  const [data, setData]     = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportsSummary()
      .then(r => setData({ ...DEFAULT, ...r.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:'2rem', color:'#999' }}>Loading reports…</div>;

  return (
    <>
      <div className="section-title">Key Performance Metrics</div>
      <div className="widgets-grid">
        <Widget title="Total Customers"    value={data.totalCustomers}   subtitle="Organizations" />
        <Widget title="Total Projects"     value={data.totalProjects}    subtitle="Lifetime" />
        <Widget title="Total Elevators"    value={data.totalElevators}   subtitle="Installed" />
        <Widget title="Total Breakdowns"   value={data.totalBreakdowns}  subtitle="Service calls" type="warning" />
        <Widget title="Total Technicians"  value={data.totalTechnicians} subtitle="Field staff" />
        <Widget title="Active AMC"         value={data.activeAMC}        subtitle="Contracts" type="success" />
      </div>

      <h3 className="report-sub-title">Project Performance Report</h3>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th><th>Elevators</th><th>Progress</th>
              <th>Status</th><th>Budget</th><th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.projectPerf.length > 0
              ? data.projectPerf.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.name || '-'}</strong></td>
                  <td style={{ textAlign:'center' }}>{p.elevators || '-'}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ flex:1, height:'6px', background:'#e8e8e8', borderRadius:'3px' }}>
                        <div style={{ width:`${p.progress || 0}%`, height:'100%', background:'#1e3a5f', borderRadius:'3px' }} />
                      </div>
                      <span style={{ fontSize:'0.82rem', color:'#666', whiteSpace:'nowrap' }}>{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td><StatusBadge text={p.status} /></td>
                  <td>{p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : '-'}</td>
                  <td>{p.cost ? `₹${Number(p.cost).toLocaleString('en-IN')}` : '-'}</td>
                </tr>
              ))
              : <tr><td colSpan={6} style={{ textAlign:'center', padding:'1.5rem', color:'#999' }}>No project data yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      <h3 className="report-sub-title">Technician Performance Report</h3>
      <div className="data-table">
        <table>
          <thead>
            <tr><th>Technician</th><th>Location</th><th>Skills</th><th>Jobs Completed</th><th>Rating</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.techPerf.length > 0
              ? data.techPerf.map((t, i) => (
                <tr key={i}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.location || '-'}</td>
                  <td style={{ fontSize:'0.82rem', color:'#666' }}>{Array.isArray(t.skills) ? t.skills.join(', ') || '-' : t.skills || '-'}</td>
                  <td style={{ textAlign:'center' }}>{t.jobsCompleted || 0}</td>
                  <td>⭐ {t.rating || '-'}</td>
                  <td><StatusBadge text={t.status} /></td>
                </tr>
              ))
              : <tr><td colSpan={6} style={{ textAlign:'center', padding:'1.5rem', color:'#999' }}>No technician data yet</td></tr>
            }
          </tbody>
        </table>
      </div>
    </>
  );
}
