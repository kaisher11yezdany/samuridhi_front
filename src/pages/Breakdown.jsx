import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AssignUsers from '../components/AssignUsers';
import { getBreakdowns, createBreakdown, updateBreakdown } from '../api/api';
import { useAuth } from '../context/AuthContext';

const EMPTY = { customer: '', complaint: '', priority: 'MEDIUM', technician: '', site: '', elevatorId: '' };

export default function Breakdown() {
  const { can, getScope } = useAuth();
  const [list,       setList]       = useState([]);
  const [addOpen,    setAddOpen]    = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [assignFor,  setAssignFor]  = useState(null); // { id, assignedUsers }
  const [statusFor,  setStatusFor]  = useState(null); // { id, status }

  const viewScope = getScope('breakdown', 'view');
  const canCreate = can('breakdown', 'create');
  const canEdit   = can('breakdown', 'edit');

  useEffect(() => {
    getBreakdowns().then(r => setList(r.data)).catch(() => {});
  }, []);

  const critical = list.filter(b => b.priority === 'CRITICAL').length;
  const open     = list.filter(b => !['Resolved', 'Closed'].includes(b.status)).length;

  const handleAdd = async () => {
    try {
      const r = await createBreakdown(form);
      setList(l => [r.data, ...l]);
    } catch (e) { alert(e?.response?.data?.message || 'Failed to create ticket'); }
    setAddOpen(false);
    setForm(EMPTY);
  };

  const updateStatus = async (id, status) => {
    try {
      const r = await updateBreakdown(id, { status });
      setList(l => l.map(b => b._id === id ? r.data : b));
    } catch (e) { alert(e?.response?.data?.message || 'Failed to update'); }
    setStatusFor(null);
  };

  const handleAssigned = (updatedDoc) => {
    setList(l => l.map(b => b._id === updatedDoc._id ? updatedDoc : b));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="section-title" style={{ marginBottom: 0 }}>Breakdown & Service Management</div>
          {viewScope === 'own' && (
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
              Showing your assigned tickets only
            </div>
          )}
        </div>
        {canCreate && (
          <button className="btn-add" onClick={() => setAddOpen(true)}>+ New Service Request</button>
        )}
      </div>

      <div className="widgets-grid">
        <Widget title="Open Tickets"   value={open}     subtitle="Active" />
        <Widget title="Resolved Today" value={5}        subtitle="28%" type="success" />
        <Widget title="Critical"       value={critical} subtitle="Urgent" type="danger" />
        <Widget title="Avg Resolution" value="2.5hrs"   subtitle="This month" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Ticket #</th><th>Customer</th><th>Complaint</th>
              <th>Priority</th><th>Assigned</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b._id}>
                <td><strong>{b.ticketId}</strong></td>
                <td>{b.customer}</td>
                <td>{b.complaint}</td>
                <td><StatusBadge text={b.priority} /></td>
                <td style={{ fontSize: '0.82rem' }}>
                  {b.technician || '—'}
                  {b.assignedUsers?.length > 0 && (
                    <span style={{ color: '#1e3a5f', fontWeight: 600, marginLeft: 4 }}>
                      +{b.assignedUsers.length} user{b.assignedUsers.length > 1 ? 's' : ''}
                    </span>
                  )}
                </td>
                <td><StatusBadge text={b.status} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {canEdit && (
                    <>
                      <a className="action-link" onClick={() =>
                        setStatusFor({ id: b._id, status: b.status })
                      }>Update</a>
                      {' | '}
                      <a className="action-link orange" onClick={() =>
                        setAssignFor({ id: b._id, assignedUsers: b.assignedUsers || [] })
                      }>Assign</a>
                    </>
                  )}
                  {!canEdit && <span style={{ color: '#ccc', fontSize: '0.8rem' }}>View only</span>}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                {viewScope === 'own' ? 'No tickets assigned to you yet.' : 'No tickets found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Service Request */}
      {addOpen && (
        <Modal title="New Service Request" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Submit</button>
          </>}>
          {[['customer','Customer *'],['complaint','Complaint *'],['site','Site'],['elevatorId','Elevator ID'],['technician','Lead Technician']].map(([k, lbl]) => (
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

      {/* Quick status update */}
      {statusFor && (
        <Modal title="Update Status" onClose={() => setStatusFor(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setStatusFor(null)}>Cancel</button>
          </>}>
          <div className="modal-field">
            <label>New Status</label>
            <select value={statusFor.status}
              onChange={e => setStatusFor(s => ({ ...s, status: e.target.value }))}>
              {['Pending','Assigned','In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn-save" style={{ marginTop: '0.75rem', width: '100%' }}
            onClick={() => updateStatus(statusFor.id, statusFor.status)}>
            Save Status
          </button>
        </Modal>
      )}

      {/* Assign users */}
      {assignFor && (
        <Modal title="Assign Team Members" onClose={() => setAssignFor(null)}>
          <AssignUsers
            module="breakdowns"
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
