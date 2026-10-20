import { useState, useEffect, useRef } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getSurveys, createSurvey, updateSurvey } from '../api/api';

const DEFAULT_ITEMS = [
  'Shaft dimensions verified', 'Load-bearing capacity assessed', 'Electrical supply checked',
  'Machine room dimensions', 'Pit depth measured', 'Headroom clearance', 'Door opening sizes',
  'Building structure inspection', 'Safety clearances', 'Environmental conditions',
];

const STATUSES = ['Pending', 'Scheduled', 'In Progress', 'Completed'];
const EMPTY_FORM = { project: '', site: '', customer: '', type: 'Pre-Installation', engineer: '', date: '' };

const inp = { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 };

// Convert DB object { "label": bool } → [{ label, checked }]
const objToItems = (obj) => {
  const saved = obj || {};
  // Start with defaults (preserving saved checked state), then append any extra custom keys
  const items = DEFAULT_ITEMS.map(label => ({ label, checked: !!saved[label] }));
  Object.keys(saved).filter(k => !DEFAULT_ITEMS.includes(k)).forEach(k => items.push({ label: k, checked: !!saved[k] }));
  return items;
};

// Convert [{ label, checked }] → { "label": bool }
const itemsToObj = (items) => Object.fromEntries(items.map(i => [i.label, i.checked]));

// ── Reusable checklist editor ──────────────────────────────────────────────
function ChecklistEditor({ items, onChange }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editVal, setEditVal]       = useState('');
  const [newItem, setNewItem]       = useState('');
  const editRef = useRef(null);

  const done = items.filter(i => i.checked).length;

  const toggle = (idx) => onChange(items.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it));

  const startEdit = (idx) => { setEditingIdx(idx); setEditVal(items[idx].label); setTimeout(() => editRef.current?.focus(), 0); };

  const commitEdit = (idx) => {
    const trimmed = editVal.trim();
    if (!trimmed) { setEditingIdx(null); return; }
    // Prevent duplicate labels
    if (items.some((it, i) => i !== idx && it.label === trimmed)) { alert('That item already exists'); return; }
    onChange(items.map((it, i) => i === idx ? { ...it, label: trimmed } : it));
    setEditingIdx(null);
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (items.some(it => it.label === trimmed)) { alert('That item already exists'); return; }
    onChange([...items, { label: trimmed, checked: false }]);
    setNewItem('');
  };

  return (
    <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: done === items.length && items.length > 0 ? '#1baf7a' : '#888' }}>
          {done} / {items.length} checked
        </span>
      </div>

      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <input type="checkbox" checked={item.checked} onChange={() => toggle(idx)} style={{ flexShrink: 0 }} />

          {editingIdx === idx ? (
            <input
              ref={editRef}
              type="text"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(idx); if (e.key === 'Escape') setEditingIdx(null); }}
              onBlur={() => commitEdit(idx)}
              style={{ flex: 1, padding: '2px 6px', border: '1px solid #1e3a5f', borderRadius: '4px', fontSize: '0.88rem' }}
            />
          ) : (
            <span style={{ flex: 1, fontSize: '0.88rem', textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#999' : '#333' }}>
              {item.label}
            </span>
          )}

          {/* Edit button */}
          <button onClick={() => editingIdx === idx ? commitEdit(idx) : startEdit(idx)}
            title="Edit item"
            style={{ border: '1px solid #ddd', background: 'white', cursor: 'pointer', color: editingIdx === idx ? '#1e3a5f' : '#888', fontSize: '0.75rem', padding: '1px 6px', borderRadius: '4px', lineHeight: 1.4 }}>
            {editingIdx === idx ? 'Save' : 'Edit'}
          </button>

          {/* Delete button */}
          <button onClick={() => remove(idx)}
            title="Delete item"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e34948', fontSize: '1rem', padding: '0 2px', lineHeight: 1 }}>
            ✕
          </button>
        </div>
      ))}

      {/* Add new item */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', borderTop: '1px solid #e8e8e8', paddingTop: '10px' }}>
        <input
          type="text"
          placeholder="Add checklist item…"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
        />
        <button onClick={add}
          style={{ padding: '0.4rem 0.9rem', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          + Add
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Survey() {
  const [surveys, setSurveys]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);

  // View/Edit modal state
  const [viewItems, setViewItems]   = useState([]);
  const [findings, setFindings]     = useState('');
  const [editStatus, setEditStatus] = useState('');

  // New Survey modal state
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formItems, setFormItems] = useState([]);

  const [saving, setSaving] = useState(false);

  const load = () => getSurveys().then(r => setSurveys(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const completed  = surveys.filter(s => s.status === 'Completed').length;
  const inProgress = surveys.filter(s => s.status === 'In Progress').length;
  const scheduled  = surveys.filter(s => ['Scheduled', 'Pending'].includes(s.status)).length;

  const openView = (s) => {
    setViewItems(objToItems(s.checklist));
    setFindings(s.findings || '');
    setEditStatus(s.status);
    setSelected(s);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSurvey(selected._id, { checklist: itemsToObj(viewItems), findings, status: editStatus });
      await load();
      setSelected(null);
    } catch (e) { alert(e.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormItems(DEFAULT_ITEMS.map(label => ({ label, checked: false })));
    setShowAdd(true);
  };

  const handleCreate = async () => {
    if (!form.project) return alert('Project name is required');
    setSaving(true);
    try {
      await createSurvey({ ...form, checklist: itemsToObj(formItems) });
      await load();
      setShowAdd(false);
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total Surveys" value={surveys.length} subtitle="All survey requests" />
        <Widget title="Completed"     value={completed}      subtitle="Assessments done"  type="success" />
        <Widget title="In Progress"   value={inProgress}     subtitle="Currently active"  type="warning" />
        <Widget title="Scheduled"     value={scheduled}      subtitle="Upcoming"          type="warning" />
      </div>

      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Survey & Inspection Records
        <button className="btn-primary" onClick={openAdd}>+ New Survey</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Survey ID</th><th>Project</th><th>Site</th><th>Type</th>
              <th>Engineer</th><th>Date</th><th>Checklist</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.length > 0
              ? surveys.map(s => {
                  const cl = s.checklist || {};
                  const done  = Object.values(cl).filter(Boolean).length;
                  const total = Object.keys(cl).length || DEFAULT_ITEMS.length;
                  return (
                    <tr key={s._id}>
                      <td><strong>{s.surveyId}</strong></td>
                      <td>{s.project}</td>
                      <td>{s.site || '-'}</td>
                      <td>{s.type}</td>
                      <td>{s.engineer || '-'}</td>
                      <td>{s.date || '-'}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: done === total && total > 0 ? '#1baf7a' : '#666' }}>
                          {done}/{total} ✓
                        </span>
                      </td>
                      <td><StatusBadge text={s.status} /></td>
                      <td><button className="btn-action" onClick={() => openView(s)}>View / Edit</button></td>
                    </tr>
                  );
                })
              : <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No surveys yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {/* View / Edit Modal */}
      {selected && (
        <Modal title={`Survey — ${selected.surveyId}`} onClose={() => setSelected(null)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ]}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[['Project', selected.project], ['Site', selected.site || '-'],
              ['Type', selected.type], ['Engineer', selected.engineer || '-'],
              ['Date', selected.date || '-']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.78rem', color: '#999', marginBottom: '2px' }}>{k}</div>
                <div style={{ fontWeight: 500 }}>{v}</div>
              </div>
            ))}
            <div>
              <label style={lbl}>Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ ...inp, padding: '0.35rem' }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Site Inspection Checklist</div>
          <ChecklistEditor items={viewItems} onChange={setViewItems} />

          <div style={{ marginTop: '1rem' }}>
            <label style={lbl}>Findings / Notes</label>
            <textarea value={findings} onChange={e => setFindings(e.target.value)}
              rows={3} placeholder="Enter findings, observations or notes…"
              style={{ ...inp, resize: 'vertical' }} />
          </div>
        </Modal>
      )}

      {/* New Survey Modal */}
      {showAdd && (
        <Modal title="Schedule New Survey" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Schedule'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[['Project Name *', 'project', 'text'], ['Site Address', 'site', 'text'],
              ['Customer', 'customer', 'text'], ['Assigned Engineer', 'engineer', 'text'],
              ['Survey Date', 'date', 'date']].map(([label, key, type]) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div>
              <label style={lbl}>Survey Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                <option>Pre-Installation</option>
                <option>Site Inspection</option>
                <option>Feasibility Study</option>
                <option>Post-Installation Audit</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Site Inspection Checklist</label>
              <ChecklistEditor items={formItems} onChange={setFormItems} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
