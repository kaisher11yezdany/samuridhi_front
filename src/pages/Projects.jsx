import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getProjects, createProject, updateProject } from '../api/api';

const FALLBACK = [];

const progressBg = (p) => p === 100 ? '#e8f5e9' : p === 0 ? '#ffebee' : '#fff3e0';

const EMPTY = { customer:'', elevators:'', startDate:'', targetDate:'', budget:'', status:'In Progress', progress:0 };

export default function Projects() {
  const [list, setList]         = useState(FALLBACK);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => getProjects().then(r => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const completed  = list.filter(p => p.status === 'Completed').length;
  const inProgress = list.filter(p => p.status === 'In Progress').length;
  const delayed    = list.filter(p => p.status === 'Delayed').length;

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      customer: p.customer || '',
      elevators: p.elevators || '',
      startDate: p.startDate || '',
      targetDate: p.targetDate || '',
      budget: p.budget || '',
      status: p.status || 'In Progress',
      progress: p.progress ?? 0,
    });
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateProject(editItem._id, { ...form, elevators: Number(form.elevators), progress: Number(form.progress) });
      await load();
      setEditItem(null);
    } catch (e) { alert(e.response?.data?.message || 'Error saving project'); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!form.customer) return;
    setSaving(true);
    try {
      await createProject({ ...form, elevators: Number(form.elevators), progress: Number(form.progress) });
      await load();
      setShowAdd(false);
      setForm(EMPTY);
    } catch (e) { alert(e.response?.data?.message || 'Error creating project'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Project Management</div>
        <button className="btn-add" onClick={() => { setForm(EMPTY); setShowAdd(true); }}>+ Create New Project</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Projects" value={list.length}  subtitle="All time" />
        <Widget title="Completed"      value={completed}    subtitle={`${Math.round((completed / (list.length || 1)) * 100)}%`} type="success" />
        <Widget title="In Progress"    value={inProgress}   subtitle="Active" />
        <Widget title="Delayed"        value={delayed}      subtitle="Urgent" type="warning" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Project ID</th><th>Customer</th><th>Elevators</th>
              <th>Start Date</th><th>Target Date</th><th>Progress</th>
              <th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0
              ? list.map(p => (
                <tr key={p._id}>
                  <td>{p.projectId}</td>
                  <td>{p.customer}</td>
                  <td>{p.elevators}</td>
                  <td>{p.startDate}</td>
                  <td>{p.targetDate}</td>
                  <td>
                    <span className="progress-cell" style={{ background: progressBg(p.progress), color:'#333' }}>
                      {p.progress}%
                    </span>
                  </td>
                  <td><StatusBadge text={p.status} /></td>
                  <td>
                    <a className="action-link" onClick={() => setViewItem(p)}>View</a>
                    {' | '}
                    <a className="action-link orange" onClick={() => openEdit(p)}>
                      {p.status === 'Completed' ? 'Close' : p.status === 'Delayed' ? 'Reschedule' : 'Edit'}
                    </a>
                  </td>
                </tr>
              ))
              : <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No projects yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <Modal title="Project Details" onClose={() => setViewItem(null)}
          actions={[
            <button key="edit" className="btn-primary" onClick={() => { setViewItem(null); openEdit(viewItem); }}>Edit</button>,
            <button key="c" className="btn-secondary" onClick={() => setViewItem(null)}>Close</button>,
          ]}>
          <div className="modal-info">
            {[['Project ID', viewItem.projectId], ['Customer', viewItem.customer],
              ['No. of Elevators', viewItem.elevators], ['Start Date', viewItem.startDate],
              ['Target Date', viewItem.targetDate], ['Progress', `${viewItem.progress}%`],
              ['Budget', viewItem.budget ? `₹${viewItem.budget}` : '-'],
              ['Cost', viewItem.cost ? `₹${viewItem.cost}` : '-'],
              ['Status', viewItem.status]].map(([l, v]) => (
              <div key={l} className="modal-info-row">
                <span className="modal-info-label">{l}:</span>
                <span className="modal-info-value">{l === 'Status' ? <StatusBadge text={v} /> : v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title={`Edit Project — ${editItem.projectId}`} onClose={() => setEditItem(null)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>
            {[['Customer','customer','text'],['Number of Elevators','elevators','number'],
              ['Start Date','startDate','date'],['Target Date','targetDate','date'],
              ['Budget (₹)','budget','text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Progress (%)</label>
              <input type="range" min={0} max={100} value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                style={{ width:'100%' }} />
              <div style={{ textAlign:'right', fontSize:'0.85rem', color:'#666' }}>{form.progress}%</div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Create New Project" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Create Project'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>
            {[['Customer','customer','text'],['Number of Elevators','elevators','number'],
              ['Start Date','startDate','date'],['Target Date','targetDate','date'],
              ['Budget (₹)','budget','text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
