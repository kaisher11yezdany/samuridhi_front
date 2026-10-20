import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getHandovers, createHandover, updateHandover } from '../api/api';

const DOCS_LIST = ['Completion Certificate','Inspection Report','O&M Manual','Warranty Card','AMC Agreement','Spare Parts List','Emergency Contact List','Customer Training Record'];
const EMPTY = { project:'', customer:'', elevators:'', handoverDate:'' };

export default function Handover() {
  const [handovers, setHandovers] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);

  const load = () => getHandovers().then(r => setHandovers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const completed = handovers.filter(h => h.status === 'Completed').length;
  const pending   = handovers.filter(h => ['Pending','In Progress'].includes(h.status)).length;
  const scheduled = handovers.filter(h => h.status === 'Scheduled').length;

  const handleAdd = async () => {
    if (!form.project) return;
    setSaving(true);
    try { await createHandover({ ...form, elevators: Number(form.elevators) || 1 }); await load(); setShowAdd(false); setForm(EMPTY); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!selected) return;
    try { await updateHandover(selected._id, { status: 'Completed' }); await load(); setSelected(null); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total Handovers"       value={handovers.length} subtitle="Project completions" />
        <Widget title="Completed"             value={completed}        subtitle="Successfully handed over" type="success" />
        <Widget title="In Progress / Pending" value={pending}          subtitle="Awaiting completion"      type="warning" />
        <Widget title="Scheduled"             value={scheduled}        subtitle="Upcoming handovers" />
      </div>

      <div className="section-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        Handover Management
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Schedule Handover</button>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Handover ID</th><th>Project</th><th>Customer</th><th>Elevators</th>
              <th>Handover Date</th><th>Accepted By</th><th>Documents</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {handovers.length > 0
              ? handovers.map(h => (
                <tr key={h._id}>
                  <td><strong>{h.handoverId}</strong></td>
                  <td>{h.project}</td>
                  <td>{h.customer || '-'}</td>
                  <td style={{ textAlign:'center' }}>{h.elevators}</td>
                  <td>{h.handoverDate || '-'}</td>
                  <td>{h.acceptedBy || 'Pending'}</td>
                  <td>
                    <span style={{ background:'#e8f5e9', color:'#1baf7a', borderRadius:'12px', padding:'2px 8px', fontSize:'0.8rem' }}>
                      {(h.docs || []).length} files
                    </span>
                  </td>
                  <td><StatusBadge text={h.status} /></td>
                  <td><button className="btn-action" onClick={() => setSelected(h)}>Manage</button></td>
                </tr>
              ))
              : <tr><td colSpan={9} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No handovers yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={`Handover — ${selected.handoverId} (${selected.project})`} onClose={() => setSelected(null)}
          actions={[
            selected.status !== 'Completed' && <button key="complete" className="btn-primary" onClick={handleComplete}>Mark Completed</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ].filter(Boolean)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[['Customer', selected.customer || '-'], ['Elevators', selected.elevators],
              ['Date', selected.handoverDate || '-'], ['Accepted By', selected.acceptedBy || 'Pending']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:'0.78rem', color:'#999' }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight:600, marginBottom:'8px' }}>Handover Document Checklist</div>
          {DOCS_LIST.map(doc => {
            const uploaded = (selected.docs || []).includes(doc);
            return (
              <label key={doc} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', cursor:'pointer' }}>
                <input type="checkbox" defaultChecked={uploaded} readOnly />
                {doc}
                {uploaded && <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:'#1baf7a', fontWeight:500 }}>✓ Uploaded</span>}
              </label>
            );
          })}
          <div style={{ marginTop:'1rem' }}>
            <div style={{ fontWeight:600, marginBottom:'4px' }}>Customer Signature</div>
            <div style={{ border:'1px dashed #ccc', borderRadius:'6px', height:'80px', display:'flex', alignItems:'center', justifyContent:'center', color:'#999', fontSize:'0.88rem' }}>
              {selected.acceptedBy && selected.acceptedBy !== 'Pending' ? `Signed by ${selected.acceptedBy}` : 'Awaiting signature'}
            </div>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Schedule Handover" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Schedule'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>
            {[['Project','project','text'],['Customer','customer','text'],['Number of Elevators','elevators','number']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Handover Date</label>
              <input type="date" value={form.handoverDate} onChange={e => setForm(f => ({ ...f, handoverDate: e.target.value }))}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
