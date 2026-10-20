import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getTesting } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', customer:'ABC Corp',      site:'ABC Tower',  testDate:'Jan 14, 2024', mechanical:'Pass', electrical:'Pass', safety:'Pass', status:'Completed' },
  { _id:'2', elevatorId:'ELX-BLR-000125', customer:'XYZ Ltd',       site:'XYZ Complex',testDate:'Feb 09, 2024', mechanical:'Pass', electrical:'Pass', safety:'Pass', status:'Completed' },
  { _id:'3', elevatorId:'ELX-BLR-000126', customer:'Tech Solutions', site:'Tech Park',  testDate:'Scheduled',    mechanical:'-',    electrical:'-',    safety:'-',    status:'Pending' },
];

export default function Testing() {
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    getTesting().then(r => setList(r.data)).catch(() => {});
  }, []);

  const passed    = list.filter(t => t.status === 'Completed').length;
  const inProg    = list.filter(t => t.status === 'In Progress').length;
  const failed    = list.filter(t => t.status === 'Failed').length;

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Testing & Commissioning</div>
        <button className="btn-add">+ Schedule Test</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Tests"  value={list.length} subtitle="All time" />
        <Widget title="Passed"       value={passed}      subtitle="94%" type="success" />
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
                  <a className="action-link">
                    {t.status === 'Completed' ? 'Report' : 'Schedule'}
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
