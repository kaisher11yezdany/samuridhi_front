import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getWarranty } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', customer:'ABC Corp',      amcStart:'Jan 15, 2024', amcEnd:'Jan 14, 2025', type:'Comprehensive', coverage:'24/7',            value:'₹2,50,000', status:'Active' },
  { _id:'2', elevatorId:'ELX-BLR-000125', customer:'XYZ Ltd',       amcStart:'Feb 10, 2024', amcEnd:'Feb 09, 2025', type:'Standard',       coverage:'Business Hours',   value:'₹1,80,000', status:'Active' },
  { _id:'3', elevatorId:'ELX-BLR-000085', customer:'Central Retail', amcStart:'Jan 15, 2023', amcEnd:'Jan 14, 2024', type:'Comprehensive', coverage:'24/7',            value:'₹2,50,000', status:'Expiring Soon' },
];

export default function Warranty() {
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    getWarranty().then(r => setList(r.data)).catch(() => {});
  }, []);

  const active   = list.filter(w => w.status === 'Active').length;
  const expiring = list.filter(w => w.status === 'Expiring Soon').length;
  const expired  = list.filter(w => w.status === 'Expired').length;

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Warranty & AMC Management</div>
        <button className="btn-add">+ Create AMC</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Active Contracts"  value={active}   subtitle="Valid agreements" />
        <Widget title="Expiring Soon"     value={expiring} subtitle="Within 90 days" type="warning" />
        <Widget title="Expired"           value={expired}  subtitle="Needs renewal" type="danger" />
        <Widget title="Renewal Revenue"   value="₹45L"     subtitle="Estimated" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Elevator ID</th><th>Customer</th><th>AMC Start</th><th>AMC End</th>
              <th>Type</th><th>Coverage</th><th>Value</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(w => (
              <tr key={w._id}>
                <td>{w.elevatorId}</td>
                <td>{w.customer}</td>
                <td>{w.amcStart}</td>
                <td>{w.amcEnd}</td>
                <td>{w.type}</td>
                <td>{w.coverage}</td>
                <td>{w.value}</td>
                <td><StatusBadge text={w.status} /></td>
                <td>
                  <a className="action-link">View</a>
                  {' | '}
                  <a className="action-link orange">
                    {w.status === 'Expiring Soon' ? 'Renew Now' : 'Renew'}
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
