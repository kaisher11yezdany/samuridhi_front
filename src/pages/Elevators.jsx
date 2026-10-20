import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getElevators } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', site:'ABC Tower',    building:'Block A',    type:'Passenger',   capacity:'1500 kg', installationDate:'Jan 15, 2024', warranty:'Jan 14, 2025', status:'Operational' },
  { _id:'2', elevatorId:'ELX-BLR-000125', site:'XYZ Complex',  building:'Tower 1',    type:'Passenger',   capacity:'2000 kg', installationDate:'Feb 10, 2024', warranty:'Feb 09, 2025', status:'Operational' },
  { _id:'3', elevatorId:'ELX-BLR-000126', site:'Tech Park',     building:'Main Block', type:'Goods',       capacity:'3000 kg', installationDate:'Mar 01, 2024', warranty:'Pending',       status:'Testing' },
  { _id:'4', elevatorId:'ELX-BLR-000127', site:'Central Mall',  building:'South Wing', type:'Passenger',   capacity:'1500 kg', installationDate:'Jan 20, 2024', warranty:'Jan 19, 2025', status:'Breakdown' },
  { _id:'5', elevatorId:'ELX-BLR-000128', site:'Metro Heights', building:'Tower 2',    type:'Passenger',   capacity:'2500 kg', installationDate:'Feb 20, 2024', warranty:'Feb 19, 2025', status:'Operational' },
  { _id:'6', elevatorId:'ELX-BLR-000129', site:'Green Valley',  building:'Main',       type:'Residential', capacity:'1600 kg', installationDate:'Mar 10, 2024', warranty:'Pending',       status:'Maintenance' },
];

export default function Elevators() {
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    getElevators().then(r => setList(r.data)).catch(() => {});
  }, []);

  const operational  = list.filter(e => e.status === 'Operational').length;
  const maintenance  = list.filter(e => e.status === 'Maintenance').length;
  const breakdown    = list.filter(e => e.status === 'Breakdown').length;

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Digital Elevator Assets</div>
        <button className="btn-add">+ Generate QR Code</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Elevators"     value={list.length}   subtitle="All assets" />
        <Widget title="Operational"         value={operational}   subtitle={`${Math.round(operational/list.length*100)||0}%`} type="success" />
        <Widget title="Under Maintenance"   value={maintenance}   subtitle="Scheduled" type="warning" />
        <Widget title="Breakdown"           value={breakdown}     subtitle="Urgent" type="danger" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Elevator ID</th><th>Site</th><th>Building</th><th>Type</th>
              <th>Capacity</th><th>Install Date</th><th>Warranty</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(e => (
              <tr key={e._id}>
                <td><strong>{e.elevatorId}</strong></td>
                <td>{e.site}</td>
                <td>{e.building}</td>
                <td>{e.type}</td>
                <td>{e.capacity}</td>
                <td>{e.installationDate}</td>
                <td>{e.warranty}</td>
                <td><StatusBadge text={e.status} /></td>
                <td>
                  <a className="action-link">View</a>
                  {' | '}
                  <a className="action-link orange">
                    {e.status === 'Breakdown' ? 'Service' :
                     e.status === 'Testing'   ? 'Commission' :
                     e.status === 'Maintenance' ? 'Schedule' : 'QR'}
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
