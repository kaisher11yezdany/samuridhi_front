import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getTesting, createTestingRecord, updateTestingRecord } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', customer:'ABC Corp',      site:'ABC Tower',   testDate:'Jan 14, 2024', mechanical:'Pass', electrical:'Pass', safety:'Pass', status:'Completed' },
  { _id:'2', elevatorId:'ELX-BLR-000125', customer:'XYZ Ltd',       site:'XYZ Complex', testDate:'Feb 09, 2024', mechanical:'Pass', electrical:'Pass', safety:'Pass', status:'Completed' },
  { _id:'3', elevatorId:'ELX-BLR-000126', customer:'Tech Solutions', site:'Tech Park',   testDate:'Scheduled',    mechanical:'-',    electrical:'-',    safety:'-',    status:'Pending' },
];

export default function Testing() {
  const [list,       setList]       = useState(FALLBACK);
  const [viewItem,   setViewItem]   = useState(null);   // Report / details
  const [schedItem,  setSchedItem]  = useState(null);   // Schedule modal
  const [schedDate,  setSchedDate]  = useState('');
  const [addOpen,    setAddOpen]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [addForm,    setAddForm]    = useState({ elevatorId:'', customer:'', site:'', testDate:'' });

  useEffect(() => {
    getTesting().then(r => setList(r.data)).catch(() => {});
  }, []);

  const passed = list.filter(t => t.status === 'Completed').length;
  const inProg = list.filter(t => t.status === 'In Progress').length;
  const failed = list.filter(t => t.status === 'Failed').length;

  const handleSchedule = async () => {
    if (!schedDate) return alert('Please select a date.');
    setSaving(true);
    try {
      const r = await updateTestingRecord(schedItem._id, { testDate: schedDate, status: 'In Progress' });
      setList(l => l.map(x => x._id === schedItem._id ? r.data : x));
    } catch {
      setList(l => l.map(x => x._id === schedItem._id ? { ...x, testDate: schedDate, status: 'In Progress' } : x));
    }
    setSaving(false); setSchedItem(null); setSchedDate('');
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const r = await createTestingRecord({ ...addForm, mechanical:'-', electrical:'-', safety:'-', status:'Pending' });
      setList(l => [r.data, ...l]);
    } catch {
      setList(l => [{ ...addForm, _id: Date.now().toString(), mechanical:'-', electrical:'-', safety:'-', status:'Pending' }, ...l]);
    }
    setSaving(false); setAddOpen(false); setAddForm({ elevatorId:'', customer:'', site:'', testDate:'' });
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Testing & Commissioning</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ Schedule Test</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Tests"  value={list.length} subtitle="All time" />
        <Widget title="Passed"       value={passed}      subtitle="Completed" type="success" />
        <Widget title="In Progress"  value={inProg}      subtitle="Active" type="warning" />
        <Widget title="Failed"       value={failed}      subtitle="Retesting" type="danger" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Elevator ID</th><th>Customer</th><th>Site</th><th>Test Date</th>
              <th>Mechanical</th><th>Electrical</th><th>Safety</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t._id}>
                <td>{t.elevatorId}</td>
                <td>{t.customer}</td>
                <td>{t.site}</td>
                <td>{t.testDate}</td>
                <td>{t.mechanical === '-' ? '-' : <StatusBadge text={t.mechanical} />}</td>
                <td>{t.electrical === '-' ? '-' : <StatusBadge text={t.electrical} />}</td>
                <td>{t.safety === '-'     ? '-' : <StatusBadge text={t.safety} />}</td>
                <td><StatusBadge text={t.status} /></td>
                <td>
                  <a className="action-link" style={{ cursor:'pointer' }} onClick={() => setViewItem(t)}>
                    {t.status === 'Completed' ? 'Report' : 'View'}
                  </a>
                  {t.status !== 'Completed' && (
                    <>
                      {' | '}
                      <a className="action-link orange" style={{ cursor:'pointer' }} onClick={() => { setSchedItem(t); setSchedDate(''); }}>
                        Schedule
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report / View Modal */}
      {viewItem && (
        <Modal title={viewItem.status === 'Completed' ? 'Test Report' : 'Test Details'} onClose={() => setViewItem(null)}
          actions={<button className="btn-save" onClick={() => setViewItem(null)}>Close</button>}>
          {[
            ['Elevator ID', viewItem.elevatorId],
            ['Customer',    viewItem.customer],
            ['Site',        viewItem.site],
            ['Test Date',   viewItem.testDate],
            ['Status',      viewItem.status],
            ['Mechanical',  viewItem.mechanical],
            ['Electrical',  viewItem.electrical],
            ['Safety',      viewItem.safety],
          ].map(([label, value]) => (
            <div key={label} className="modal-field" style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f0f2f8', padding:'8px 0', marginBottom:0 }}>
              <span style={{ fontSize:13, color:'#888', fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:13, color:'#1e3a5f', fontWeight:600 }}>{value || '—'}</span>
            </div>
          ))}
          {viewItem.status === 'Completed' && (
            <div style={{ marginTop:16, padding:12, background:'#d1fae5', borderRadius:8, textAlign:'center' }}>
              <span style={{ color:'#065f46', fontWeight:700, fontSize:14 }}>✓ All Tests Passed — Ready for Commissioning</span>
            </div>
          )}
        </Modal>
      )}

      {/* Schedule Modal */}
      {schedItem && (
        <Modal title="Schedule Test" onClose={() => setSchedItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setSchedItem(null)}>Cancel</button>
            <button className="btn-save" onClick={handleSchedule} disabled={saving}>{saving ? 'Saving…' : 'Confirm Schedule'}</button>
          </>}>
          <div className="modal-field">
            <label>Elevator</label>
            <input value={schedItem.elevatorId} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Customer</label>
            <input value={schedItem.customer} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Test Date *</label>
            <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} />
          </div>
        </Modal>
      )}

      {/* Add / Schedule New Test Modal */}
      {addOpen && (
        <Modal title="Schedule New Test" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Schedule'}</button>
          </>}>
          {[['elevatorId','Elevator ID *'],['customer','Customer *'],['site','Site *']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={addForm[k]} onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Test Date *</label>
            <input type="date" value={addForm.testDate} onChange={e => setAddForm(f => ({ ...f, testDate: e.target.value }))} />
          </div>
        </Modal>
      )}
    </>
  );
}
