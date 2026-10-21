import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
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

function ViewModal({ elevator, onClose }) {
  if (!elevator) return null;
  const fields = [
    ['Elevator ID',       elevator.elevatorId],
    ['Site',              elevator.site],
    ['Building',          elevator.building],
    ['Type',              elevator.type],
    ['Capacity',          elevator.capacity],
    ['Installation Date', elevator.installationDate],
    ['Warranty',          elevator.warranty],
    ['Status',            elevator.status],
  ];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
         onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', minWidth:380, maxWidth:480, width:'90%', boxShadow:'0 8px 40px rgba(0,0,0,0.18)' }}
           onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1e3a5f' }}>Elevator Details</h3>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'#888', lineHeight:1 }}>×</button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label} style={{ borderBottom:'1px solid #f0f2f8' }}>
                <td style={{ padding:'9px 0', fontSize:13, color:'#888', fontWeight:500, width:'45%' }}>{label}</td>
                <td style={{ padding:'9px 0', fontSize:13, color:'#1e3a5f', fontWeight:600 }}>{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} style={{ marginTop:22, width:'100%', padding:'10px 0', background:'#FF6B00', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

function QRModal({ elevator, onClose }) {
  const canvasRef = useRef(null);
  if (!elevator) return null;
  const qrValue = `ELEVATOR:${elevator.elevatorId}|SITE:${elevator.site}|TYPE:${elevator.type}|STATUS:${elevator.status}`;

  function downloadQR() {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${elevator.elevatorId}-QR.png`;
    a.click();
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
         onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', minWidth:320, maxWidth:400, width:'90%', boxShadow:'0 8px 40px rgba(0,0,0,0.18)', textAlign:'center' }}
           onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1e3a5f' }}>QR Code</h3>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:20, cursor:'pointer', color:'#888', lineHeight:1 }}>×</button>
        </div>
        <p style={{ margin:'0 0 4px', fontSize:13, color:'#888' }}>Elevator ID</p>
        <p style={{ margin:'0 0 20px', fontSize:15, fontWeight:700, color:'#1e3a5f' }}>{elevator.elevatorId}</p>
        <div id="qr-canvas" style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <QRCodeCanvas value={qrValue} size={200} level="H" includeMargin />
        </div>
        <p style={{ margin:'0 0 20px', fontSize:11, color:'#aaa', wordBreak:'break-all' }}>{qrValue}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={downloadQR} style={{ flex:1, padding:'10px 0', background:'#FF6B00', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            ⬇ Download PNG
          </button>
          <button onClick={onClose} style={{ flex:1, padding:'10px 0', background:'#f0f2f8', color:'#1e3a5f', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Elevators() {
  const [list, setList] = useState(FALLBACK);
  const [selected, setSelected] = useState(null);
  const [qrElevator, setQrElevator] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getElevators().then(r => setList(r.data)).catch(() => {});
  }, []);

  const operational = list.filter(e => e.status === 'Operational').length;
  const maintenance = list.filter(e => e.status === 'Maintenance').length;
  const breakdown   = list.filter(e => e.status === 'Breakdown').length;

  function getActionLabel(status) {
    if (status === 'Breakdown')   return 'Service';
    if (status === 'Testing')     return 'Commission';
    if (status === 'Maintenance') return 'Schedule';
    return 'QR';
  }

  function handleAction(elevator) {
    const { status } = elevator;
    if (status === 'Breakdown')   return navigate('/breakdown');
    if (status === 'Testing')     return navigate('/qa');
    if (status === 'Maintenance') return navigate('/maintenance');
    setQrElevator(elevator);
  }

  return (
    <>
      <ViewModal elevator={selected} onClose={() => setSelected(null)} />
      <QRModal elevator={qrElevator} onClose={() => setQrElevator(null)} />

      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Digital Elevator Assets</div>
        <button className="btn-add">+ Generate QR Code</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Elevators"   value={list.length}   subtitle="All assets" />
        <Widget title="Operational"       value={operational}   subtitle={`${Math.round(operational/list.length*100)||0}%`} type="success" />
        <Widget title="Under Maintenance" value={maintenance}   subtitle="Scheduled" type="warning" />
        <Widget title="Breakdown"         value={breakdown}     subtitle="Urgent" type="danger" />
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
                  <a className="action-link" style={{ cursor:'pointer' }} onClick={() => setSelected(e)}>View</a>
                  {' | '}
                  <a className="action-link orange" style={{ cursor:'pointer' }} onClick={() => handleAction(e)}>
                    {getActionLabel(e.status)}
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
