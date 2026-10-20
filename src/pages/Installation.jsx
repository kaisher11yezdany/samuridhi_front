import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getInstallations, createInstallation, updateInstallation } from '../api/api';

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

const EMPTY_FORM = {
  customer: '', site: '', elevatorId: '', supervisor: '',
  startDate: '', targetDate: '', status: 'Not Started', progress: 0, remarks: '',
};

const EMPTY_UPDATE = { progress: 0, status: 'In Progress', supervisor: '', remarks: '' };

const inp = { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 };

export default function Installation() {
  const [list, setList]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [showUpdate, setUpdate] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [upd, setUpd]           = useState(EMPTY_UPDATE);
  const [saving, setSaving]     = useState(false);

  const load = () => getInstallations().then(r => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const completed  = list.filter(i => i.status === 'Completed').length;
  const inProgress = list.filter(i => i.status === 'In Progress').length;
  const pending    = list.filter(i => i.status === 'Not Started').length;

  const openUpdate = (item) => {
    setUpd({ progress: item.progress || 0, status: item.status, supervisor: item.supervisor || '', remarks: item.remarks || '' });
    setUpdate(item);
  };

  const handleCreate = async () => {
    if (!form.customer) return alert('Customer is required');
    setSaving(true);
    try {
      await createInstallation(form);
      await load();
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch (e) { alert(e.response?.data?.message || 'Error creating installation'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateInstallation(showUpdate._id, upd);
      await load();
      setUpdate(null);
      if (selected?._id === showUpdate._id) setSelected(null);
    } catch (e) { alert(e.response?.data?.message || 'Error updating'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom: 0 }}>Installation Management</div>
        <button className="btn-add" onClick={() => { setForm(EMPTY_FORM); setShowAdd(true); }}>+ Schedule Installation</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Installations" value={list.length}  subtitle="All time" />
        <Widget title="Completed"           value={completed}    subtitle="Finished"    type="success" />
        <Widget title="In Progress"         value={inProgress}   subtitle="Active"      type="warning" />
        <Widget title="Pending"             value={pending}      subtitle="Not started" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Customer</th><th>Site</th>
              <th>Start Date</th><th>Target Date</th><th>Progress</th>
              <th>Supervisor</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? list.map(i => (
              <tr key={i._id}>
                <td>{i.installationId || '-'}</td>
                <td>{i.customer}</td>
                <td>{i.site || '-'}</td>
                <td>{i.startDate || '-'}</td>
                <td>{i.targetDate || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#e8e8e8', borderRadius: '3px', minWidth: '60px' }}>
                      <div style={{ width: `${i.progress || 0}%`, height: '100%', background: i.progress === 100 ? '#1baf7a' : '#1e3a5f', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#666' }}>{i.progress || 0}%</span>
                  </div>
                </td>
                <td>{i.supervisor || '-'}</td>
                <td><StatusBadge text={i.status} /></td>
                <td>
                  <button className="btn-action" onClick={() => setSelected(i)}>View</button>
                  {' '}
                  <button className="btn-action orange" onClick={() => openUpdate(i)}>
                    {i.status === 'Completed' ? 'Edit' : i.status === 'Not Started' ? 'Start' : 'Update'}
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '1.5rem', color: '#999' }}>No installations found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selected && (
        <Modal title={`Installation — ${selected.installationId || selected.customer}`} onClose={() => setSelected(null)}
          actions={[
            <button key="upd" className="btn-primary" onClick={() => { openUpdate(selected); setSelected(null); }}>Update Progress</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              ['Installation ID', selected.installationId || '-'],
              ['Elevator ID', selected.elevatorId || '-'],
              ['Customer', selected.customer],
              ['Site', selected.site || '-'],
              ['Supervisor', selected.supervisor || '-'],
              ['Start Date', selected.startDate || '-'],
              ['Target Date', selected.targetDate || '-'],
              ['Status', <StatusBadge key="s" text={selected.status} />],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.78rem', color: '#999' }}>{k}</div>
                <div style={{ fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#999', marginBottom: '4px' }}>Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '10px', background: '#e8e8e8', borderRadius: '5px' }}>
                <div style={{ width: `${selected.progress || 0}%`, height: '100%', background: selected.progress === 100 ? '#1baf7a' : '#1e3a5f', borderRadius: '5px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{selected.progress || 0}%</span>
            </div>
          </div>
          {selected.remarks && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#999', marginBottom: '4px' }}>Remarks</div>
              <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}>{selected.remarks}</div>
            </div>
          )}
        </Modal>
      )}

      {/* Update Modal */}
      {showUpdate && (
        <Modal title={`Update — ${showUpdate.customer}`} onClose={() => setUpdate(null)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setUpdate(null)}>Cancel</button>,
          ]}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={lbl}>Status</label>
              <select value={upd.status} onChange={e => setUpd(u => ({ ...u, status: e.target.value }))} style={inp}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Progress — {upd.progress}%</label>
              <input type="range" min={0} max={100} value={upd.progress}
                onChange={e => setUpd(u => ({ ...u, progress: Number(e.target.value) }))}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={lbl}>Supervisor</label>
              <input type="text" value={upd.supervisor} onChange={e => setUpd(u => ({ ...u, supervisor: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Remarks</label>
              <textarea value={upd.remarks} onChange={e => setUpd(u => ({ ...u, remarks: e.target.value }))}
                rows={3} style={{ ...inp, resize: 'vertical' }} />
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule / Create Modal */}
      {showAdd && (
        <Modal title="Schedule Installation" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Schedule'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              ['Customer *', 'customer', 'text'],
              ['Site', 'site', 'text'],
              ['Elevator ID', 'elevatorId', 'text'],
              ['Supervisor', 'supervisor', 'text'],
              ['Start Date', 'startDate', 'date'],
              ['Target Date', 'targetDate', 'date'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Remarks</label>
              <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                rows={2} style={{ ...inp, resize: 'vertical' }} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
