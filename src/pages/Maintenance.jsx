import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getMaintenance } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', customer:'ABC Corp',       site:'ABC Tower',  schedule:'Monthly',   dueDate:'Apr 15, 2024', technician:'John Sharma',  type:'Routine',   status:'Completed' },
  { _id:'2', elevatorId:'ELX-BLR-000125', customer:'XYZ Ltd',        site:'XYZ Complex',schedule:'Monthly',   dueDate:'Apr 10, 2024', technician:'Priya Kumar',  type:'Routine',   status:'In Progress' },
  { _id:'3', elevatorId:'ELX-BLR-000118', customer:'Tech Solutions', site:'Tech Park',  schedule:'Quarterly', dueDate:'Apr 05, 2024', technician:'Raj Patel',    type:'Intensive', status:'Pending' },
  { _id:'4', elevatorId:'ELX-BLR-000126', customer:'Tech Park',      site:'Main Block', schedule:'Monthly',   dueDate:'Apr 20, 2024', technician:'Anita Singh',  type:'Routine',   status:'Scheduled' },
];

export default function Maintenance() {
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    getMaintenance().then(r => setList(r.data)).catch(() => {});
  }, []);

  const completed = list.filter(m => m.status === 'Completed').length;
  const pending   = list.filter(m => ['Pending','Scheduled'].includes(m.status)).length;

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Preventive Maintenance</div>
        <button className="btn-add">+ Schedule Maintenance</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Due This Month" value={list.length} subtitle="Scheduled" />
        <Widget title="Completed"      value={completed}   subtitle={`${Math.round(completed/list.length*100)||0}%`} type="success" />
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
                <td>{m.technician}</td>
                <td>{m.type}</td>
                <td><StatusBadge text={m.status} /></td>
                <td>
                  <a className="action-link">
                    {m.status === 'Completed' ? 'Report' : 'View'}
                  </a>
                  {' | '}
                  <a className="action-link orange">
                    {m.status === 'Completed' ? 'Approve' :
                     m.status === 'In Progress' ? 'Track' :
                     m.status === 'Pending' ? 'Assign' : 'Reschedule'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
