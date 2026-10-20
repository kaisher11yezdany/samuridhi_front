import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AssignUsers from '../components/AssignUsers';
import { getMaintenance, createMaintenance, updateMaintenance } from '../api/api';
import { useAuth } from '../context/AuthContext';

const EMPTY = { elevatorId: '', customer: '', site: '', schedule: 'Monthly', dueDate: '', technician: '', type: 'Routine' };

export default function Maintenance() {
  const { can, getScope } = useAuth();
  const [list,      setList]      = useState([]);
  const [addOpen,   setAddOpen]   = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [assignFor, setAssignFor] = useState(null);

  const viewScope = getScope('maintenance', 'view');
  const canCreate = can('maintenance', 'create');
  const canEdit   = can('maintenance', 'edit');

  useEffect(() => {
    getMaintenance().then(r => setList(r.data)).catch(() => {});
  }, []);

  const completed = list.filter(m => m.status === 'Completed').length;
  const pending   = list.filter(m => ['Pending','Scheduled'].includes(m.status)).length;

  const handleAdd = async () => {
    try {
      const r = await createMaintenance(form);
      setList(l => [r.data, ...l]);
    } catch (e) { alert(e?.response?.data?.message || 'Failed to schedule maintenance'); }
    setAddOpen(false);
    setForm(EMPTY);
  };

  const updateStatus = async (id, status) => {
    try {
      const r = await updateMaintenance(id, { status });
      setList(l => l.map(m => m._id === id ? r.data : m));
    } catch (e) { alert(e?.response?.data?.message || 'Failed to update'); }
  };

  const handleAssigned = updated => {
    setList(l => l.map(m => m._id === updated._id ? updated : m));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="section-title" style={{ marginBottom: 0 }}>Preventive Maintenance</div>
          {viewScope === 'own' && (
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
              Showing your assigned tasks only
            </div>
          )}
        </div>
        {canCreate && (
          <button className="btn-add" onClick={() => setAddOpen(true)}>+ Schedule Maintenance</button>
        )}
      </div>

      <div className="widgets-grid">
        <Widget title="Due This Month" value={list.length} subtitle="Scheduled" />
        <Widget title="Completed"      value={completed}   subtitle={`${Math.round(completed / (list.length || 1) * 100)}%`} type="success" />
        <Widget title="Pending"        value={pending}     subtitle="Upcoming" type="warning" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Elevator ID</th><th>Customer</th><th>Site</th>
              <th>Schedule</th><th>Due Date</th><th>Technician</th>
              <th>Type</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(m => (
              <tr key={m._id}>
                <td>{m.elevatorId}</td>
                <td>{m.customer}</td>
                <td>{m.site}</td>
                <td>{m.schedule}</td>
                <td>{m.dueDate}</td>
                <td style={{ fontSize: '0.82rem' }}>
                  {m.technician || '—'}
                  {m.assignedUsers?.length > 0 && (
                    <span style={{ color: '#1e3a5f', fontWeight: 600, marginLeft: 4 }}>
                      +{m.assignedUsers.length}
                    </span>
                  )}
                </td>
                <td>{m.type}</td>
                <td><StatusBadge text={m.status} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {canEdit ? (
                    <>
                      <a className="action-link" onClick={() => updateStatus(m._id,
                        m.status === 'Completed' ? 'Completed' :
                        m.status === 'In Progress' ? 'Completed' : 'In Progress'
                      )}>
                        {m.status === 'Completed' ? 'Done' :
                         m.status === 'In Progress' ? 'Complete' : 'Start'}
                      </a>
                      {' | '}
                      <a className="action-link orange" onClick={() =>
                        setAssignFor({ id: m._id, assignedUsers: m.assignedUsers || [] })
                      }>Assign</a>
                    </>
                  ) : (
                    <span style={{ color: '#ccc', fontSize: '0.8rem' }}>View only</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                {viewScope === 'own' ? 'No tasks assigned to you yet.' : 'No maintenance records found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Maintenance */}
      {addOpen && (
        <Modal title="Schedule Maintenance" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Schedule</button>
          </>}>
          {[['elevatorId','Elevator ID *'],['customer','Customer'],['site','Site'],['technician','Lead Technician'],['dueDate','Due Date']].map(([k, lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Schedule</label>
            <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}>
              {['Monthly','Quarterly','Half-Yearly','Annual'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="modal-field">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Routine','Intensive','Emergency'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {/* Assign users */}
      {assignFor && (
        <Modal title="Assign Team Members" onClose={() => setAssignFor(null)}>
          <AssignUsers
            module="maintenance"
            docId={assignFor.id}
            assignedUsers={assignFor.assignedUsers}
            onUpdate={handleAssigned}
            onClose={() => setAssignFor(null)}
          />
        </Modal>
      )}
    </>
  );
}
