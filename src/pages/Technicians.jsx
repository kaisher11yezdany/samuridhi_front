import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getTechnicians, createTechnician } from '../api/api';

const FALLBACK = [
  { _id:'1', techId:'TECH-001', name:'John Sharma',  mobile:'98765-43210', location:'Mumbai',    skills:'Installation, Repair',       jobsCompleted:42, rating:'4.8/5', status:'Available' },
  { _id:'2', techId:'TECH-002', name:'Priya Kumar',  mobile:'99876-54321', location:'Bangalore', skills:'Testing, Commissioning',      jobsCompleted:38, rating:'4.7/5', status:'Available' },
  { _id:'3', techId:'TECH-003', name:'Raj Patel',    mobile:'97654-32109', location:'Pune',      skills:'Maintenance, Repair',         jobsCompleted:32, rating:'4.6/5', status:'Available' },
  { _id:'4', techId:'TECH-004', name:'Anita Singh',  mobile:'96543-21098', location:'Delhi',     skills:'All Skills',                  jobsCompleted:29, rating:'4.9/5', status:'On Assignment' },
  { _id:'5', techId:'TECH-005', name:'Vikram Reddy', mobile:'95432-10987', location:'Hyderabad', skills:'Installation, Testing',       jobsCompleted:36, rating:'4.5/5', status:'On Assignment' },
  { _id:'6', techId:'TECH-006', name:'Neha Gupta',   mobile:'94321-09876', location:'Chennai',   skills:'Maintenance, Service',        jobsCompleted:27, rating:'4.4/5', status:'Available' },
];

const EMPTY = { name:'', mobile:'', location:'', skills:'' };

export default function Technicians() {
  const [list,    setList]    = useState(FALLBACK);
  const [addOpen, setAddOpen] = useState(false);
  const [form,    setForm]    = useState(EMPTY);

  useEffect(() => {
    getTechnicians().then(r => setList(r.data)).catch(() => {});
  }, []);

  const available = list.filter(t => t.status !== 'On Assignment').length;
  const assigned  = list.filter(t => t.status === 'On Assignment').length;

  const handleAdd = async () => {
    try {
      const r = await createTechnician(form);
      setList(l => [r.data, ...l]);
    } catch { alert('Technician added (offline mode)'); }
    setAddOpen(false); setForm(EMPTY);
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Technician Management</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ Add Technician</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Technicians" value={list.length} subtitle="Active team" />
        <Widget title="Available"         value={available}   subtitle="Ready for work" type="success" />
        <Widget title="On Assignment"     value={assigned}    subtitle="Currently working" type="warning" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Mobile</th><th>Location</th>
              <th>Skills</th><th>Jobs Completed</th><th>Rating</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t._id}>
                <td>{t.techId}</td>
                <td><strong>{t.name}</strong></td>
                <td>{t.mobile}</td>
                <td>{t.location}</td>
                <td>{t.skills}</td>
                <td>{t.jobsCompleted}</td>
                <td>⭐ {t.rating}</td>
                <td>
                  <a className="action-link">View</a>
                  {' | '}
                  <a className="action-link orange">Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <Modal title="Add Technician" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Add Technician</button>
          </>}>
          {[['name','Full Name *'],['mobile','Mobile *'],['location','Location *'],['skills','Skills']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </Modal>
      )}
    </>
  );
}
