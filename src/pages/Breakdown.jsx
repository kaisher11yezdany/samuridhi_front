import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getBreakdowns, createBreakdown } from '../api/api';

const FALLBACK = [
  { _id:'1', ticketId:'#TKT-001456', customer:'ABC Corp',      complaint:'Elevator Breakdown', priority:'CRITICAL', technician:'John Sharma',  created:'Today, 10:30 AM', age:'30 mins', status:'In Progress' },
  { _id:'2', ticketId:'#TKT-001455', customer:'Tech Solutions', complaint:'Door Lock Issue',   priority:'HIGH',     technician:'Priya Kumar',  created:'Today, 08:45 AM', age:'2.5 hrs', status:'In Progress' },
  { _id:'3', ticketId:'#TKT-001454', customer:'Central Retail', complaint:'Levelling Issue',   priority:'MEDIUM',   technician:'Raj Patel',    created:'Yesterday, 3:15 PM', age:'1 day', status:'Pending' },
  { _id:'4', ticketId:'#TKT-001453', customer:'XYZ Ltd',        complaint:'Noise Issue',       priority:'LOW',      technician:'Anita Singh',  created:'2 days ago',       age:'2 days', status:'Pending' },
  { _id:'5', ticketId:'#TKT-001452', customer:'Metro Dev',      complaint:'Controller Fault',  priority:'HIGH',     technician:'Vikram Reddy', created:'1 day ago',        age:'1 day',  status:'In Progress' },
];

const EMPTY = { customer:'', complaint:'', priority:'MEDIUM', technician:'' };

export default function Breakdown() {
  const [list,    setList]    = useState(FALLBACK);
  const [addOpen, setAddOpen] = useState(false);
  const [form,    setForm]    = useState(EMPTY);

  useEffect(() => {
    getBreakdowns().then(r => setList(r.data)).catch(() => {});
  }, []);

  const critical = list.filter(b => b.priority === 'CRITICAL').length;
  const open     = list.filter(b => !['Resolved','Closed'].includes(b.status)).length;

  const handleAdd = async () => {
    try {
      const r = await createBreakdown({ ...form, created: 'Just now', age: '0 mins' });
      setList(l => [r.data, ...l]);
    } catch { alert('Ticket created (offline mode)'); }
    setAddOpen(false); setForm(EMPTY);
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Breakdown & Service Management</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ New Service Request</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Open Tickets"     value={open}               subtitle="Active" />
        <Widget title="Resolved Today"   value={5}                  subtitle="28%" type="success" />
        <Widget title="Critical"         value={critical}           subtitle="Urgent" type="danger" />
        <Widget title="Avg Resolution"   value="2.5hrs"             subtitle="This month" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Ticket #</th><th>Customer</th><th>Complaint</th>
              <th>Priority</th><th>Technician</th><th>Created</th>
              <th>Age</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b._id}>
                <td><strong>{b.ticketId}</strong></td>
                <td>{b.customer}</td>
                <td>{b.complaint}</td>
                <td><StatusBadge text={b.priority} /></td>
                <td>{b.technician}</td>
                <td>{b.created}</td>
                <td>{b.age}</td>
                <td><StatusBadge text={b.status} /></td>
                <td>
                  <a className="action-link">View</a>
                  {' | '}
                  <a className="action-link orange">
                    {b.status === 'Pending' ? 'Assign' : b.priority === 'LOW' ? 'Close' : 'Update'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <Modal title="New Service Request" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Submit</button>
          </>}>
          {[['customer','Customer *'],['complaint','Complaint *'],['technician','Assign Technician']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['CRITICAL','HIGH','MEDIUM','LOW'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
