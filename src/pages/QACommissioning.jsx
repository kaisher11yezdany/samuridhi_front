import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getQARecords, createQARecord, updateQARecord } from '../api/api';

const QA_CHECKLIST = [
  { category: 'Safety',      items: ['Emergency stop functional', 'Overload sensor calibrated', 'Door safety edges working', 'ARD tested'] },
  { category: 'Electrical',  items: ['Motor insulation resistance', 'Earth continuity verified', 'Control panel wiring', 'Phase reversal protection'] },
  { category: 'Mechanical',  items: ['Guide rail alignment', 'Buffer compression test', 'Rope tension balanced', 'Brake holding force'] },
  { category: 'Performance', items: ['Speed verification', 'Levelling accuracy ±5mm', 'Noise level < 55dB', 'Vibration within limits'] },
];

const EMPTY = { project:'', elevatorId:'', type:'Final Testing', inspector:'', date:'' };

export default function QACommissioning() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [checks, setChecks]     = useState({});
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => getQARecords().then(r => setRecords(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const passed    = records.filter(q => q.status === 'Passed').length;
  const failed    = records.filter(q => q.status === 'Failed').length;
  const scheduled = records.filter(q => ['Scheduled','Pending'].includes(q.status)).length;

  const handleAdd = async () => {
    if (!form.project) return;
    setSaving(true);
    try { await createQARecord(form); await load(); setShowAdd(false); setForm(EMPTY); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      const allItems = QA_CHECKLIST.flatMap(s => s.items);
      const passed = allItems.filter(item => checks[item]).length;
      const score = `${Math.round((passed / allItems.length) * 100)}/100`;
      const status = passed / allItems.length >= 0.8 ? 'Passed' : 'Failed';
      await updateQARecord(selected._id, { checklist: checks, score, status });
      await load();
      setSelected(null);
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total QA Records" value={records.length} subtitle="All inspections" />
        <Widget title="Passed"    value={passed}    subtitle="Certified elevators" type="success" />
        <Widget title="Failed"    value={failed}    subtitle="Needs rework"        type="danger" />
        <Widget title="Scheduled" value={scheduled} subtitle="Upcoming checks"     type="warning" />
      </div>

      <div className="section-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        QA & Commissioning Records
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Schedule Inspection</button>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>QA ID</th><th>Project</th><th>Elevator</th><th>Type</th>
              <th>Inspector</th><th>Date</th><th>Score</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0
              ? records.map(q => (
                <tr key={q._id}>
                  <td><strong>{q.qaId}</strong></td>
                  <td>{q.project}</td>
                  <td>{q.elevatorId || '-'}</td>
                  <td>{q.type}</td>
                  <td>{q.inspector || '-'}</td>
                  <td>{q.date || '-'}</td>
                  <td>
                    <strong style={{ color: q.score && parseInt(q.score) >= 90 ? '#1baf7a' : q.score && parseInt(q.score) < 80 ? '#e34948' : '#333' }}>
                      {q.score || '-'}
                    </strong>
                  </td>
                  <td><StatusBadge text={q.status} /></td>
                  <td><button className="btn-action" onClick={() => { setSelected(q); setChecks(q.checklist || {}); }}>Checklist</button></td>
                </tr>
              ))
              : <tr><td colSpan={9} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No QA records yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={`QA Checklist — ${selected.qaId} (${selected.project})`} onClose={() => setSelected(null)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleSubmit}>Submit Report</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ]}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            {[['Elevator', selected.elevatorId || '-'], ['Inspector', selected.inspector || '-'], ['Date', selected.date || '-'], ['Type', selected.type]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:'0.78rem', color:'#999' }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          {QA_CHECKLIST.map(section => (
            <div key={section.category} style={{ marginBottom:'1rem' }}>
              <div style={{ fontWeight:600, background:'#f0f4f8', padding:'6px 10px', borderRadius:'4px', marginBottom:'6px' }}>{section.category} Tests</div>
              {section.items.map(item => (
                <label key={item} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', cursor:'pointer', paddingLeft:'10px' }}>
                  <input type="checkbox" checked={!!checks[item]} onChange={e => setChecks(c => ({ ...c, [item]: e.target.checked }))} />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </Modal>
      )}

      {showAdd && (
        <Modal title="Schedule QA Inspection" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Schedule'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>
            {[['Project','project','text'],['Elevator ID','elevatorId','text'],['Inspector','inspector','text'],['Inspection Date','date','date']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Inspection Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
                <option>Pre-Commission</option>
                <option>Load Testing</option>
                <option>Safety Check</option>
                <option>Final Testing</option>
                <option>Commissioning</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
