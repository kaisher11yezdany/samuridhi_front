import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getWarranty, createWarranty, updateWarranty } from '../api/api';

const FALLBACK = [
  { _id:'1', elevatorId:'ELX-BLR-000124', customer:'ABC Corp',      amcStart:'Jan 15, 2024', amcEnd:'Jan 14, 2025', type:'Comprehensive', coverage:'24/7',          value:'₹2,50,000', status:'Active' },
  { _id:'2', elevatorId:'ELX-BLR-000125', customer:'XYZ Ltd',       amcStart:'Feb 10, 2024', amcEnd:'Feb 09, 2025', type:'Standard',       coverage:'Business Hours', value:'₹1,80,000', status:'Active' },
  { _id:'3', elevatorId:'ELX-BLR-000085', customer:'Central Retail', amcStart:'Jan 15, 2023', amcEnd:'Jan 14, 2024', type:'Comprehensive', coverage:'24/7',          value:'₹2,50,000', status:'Expiring Soon' },
];

export default function Warranty() {
  const [list,      setList]      = useState(FALLBACK);
  const [viewItem,  setViewItem]  = useState(null);
  const [renewItem, setRenewItem] = useState(null);
  const [addOpen,   setAddOpen]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [renewForm, setRenewForm] = useState({ amcEnd:'', type:'', value:'' });
  const [addForm,   setAddForm]   = useState({ elevatorId:'', customer:'', amcStart:'', amcEnd:'', type:'Comprehensive', coverage:'24/7', value:'' });

  useEffect(() => {
    getWarranty().then(r => setList(r.data)).catch(() => {});
  }, []);

  const active   = list.filter(w => w.status === 'Active').length;
  const expiring = list.filter(w => w.status === 'Expiring Soon').length;
  const expired  = list.filter(w => w.status === 'Expired').length;

  const handleRenew = async () => {
    if (!renewForm.amcEnd) return alert('Please set a new AMC end date.');
    setSaving(true);
    const update = { amcEnd: renewForm.amcEnd, status: 'Active' };
    if (renewForm.type)  update.type  = renewForm.type;
    if (renewForm.value) update.value = renewForm.value;
    try {
      const r = await updateWarranty(renewItem._id, update);
      setList(l => l.map(x => x._id === renewItem._id ? r.data : x));
    } catch {
      setList(l => l.map(x => x._id === renewItem._id ? { ...x, ...update } : x));
    }
    setSaving(false); setRenewItem(null);
  };

  const handleAdd = async () => {
    if (!addForm.elevatorId || !addForm.customer) return alert('Elevator ID and Customer are required.');
    setSaving(true);
    try {
      const r = await createWarranty({ ...addForm, status: 'Active' });
      setList(l => [r.data, ...l]);
    } catch {
      setList(l => [{ ...addForm, _id: Date.now().toString(), status: 'Active' }, ...l]);
    }
    setSaving(false); setAddOpen(false);
    setAddForm({ elevatorId:'', customer:'', amcStart:'', amcEnd:'', type:'Comprehensive', coverage:'24/7', value:'' });
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Warranty & AMC Management</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ Create AMC</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Active Contracts" value={active}   subtitle="Valid agreements" />
        <Widget title="Expiring Soon"    value={expiring} subtitle="Within 90 days" type="warning" />
        <Widget title="Expired"          value={expired}  subtitle="Needs renewal" type="danger" />
        <Widget title="Renewal Revenue"  value="₹45L"     subtitle="Estimated" />
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
                  <a className="action-link" style={{ cursor:'pointer' }} onClick={() => setViewItem(w)}>View</a>
                  {' | '}
                  <a className="action-link orange" style={{ cursor:'pointer' }}
                    onClick={() => { setRenewItem(w); setRenewForm({ amcEnd:'', type: w.type || '', value: w.value || '' }); }}>
                    {w.status === 'Expiring Soon' ? 'Renew Now' : 'Renew'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <Modal title="AMC Details" onClose={() => setViewItem(null)}
          actions={<button className="btn-save" onClick={() => setViewItem(null)}>Close</button>}>
          {[
            ['Elevator ID', viewItem.elevatorId],
            ['Customer',    viewItem.customer],
            ['AMC Start',   viewItem.amcStart],
            ['AMC End',     viewItem.amcEnd],
            ['Type',        viewItem.type],
            ['Coverage',    viewItem.coverage],
            ['Value',       viewItem.value],
            ['Status',      viewItem.status],
          ].map(([label, value]) => (
            <div key={label} className="modal-field" style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f0f2f8', padding:'8px 0', marginBottom:0 }}>
              <span style={{ fontSize:13, color:'#888', fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:13, color:'#1e3a5f', fontWeight:600 }}>{value || '—'}</span>
            </div>
          ))}
        </Modal>
      )}

      {/* Renew Modal */}
      {renewItem && (
        <Modal title={renewItem.status === 'Expiring Soon' ? 'Renew AMC Now' : 'Renew AMC'} onClose={() => setRenewItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setRenewItem(null)}>Cancel</button>
            <button className="btn-save" onClick={handleRenew} disabled={saving}>{saving ? 'Saving…' : 'Renew'}</button>
          </>}>
          <div className="modal-field">
            <label>Elevator</label>
            <input value={renewItem.elevatorId} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Customer</label>
            <input value={renewItem.customer} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>New AMC End Date *</label>
            <input type="date" value={renewForm.amcEnd} onChange={e => setRenewForm(f => ({ ...f, amcEnd: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Type</label>
            <select value={renewForm.type} onChange={e => setRenewForm(f => ({ ...f, type: e.target.value }))}>
              <option>Comprehensive</option>
              <option>Standard</option>
              <option>Basic</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Value</label>
            <input placeholder="e.g. ₹2,50,000" value={renewForm.value} onChange={e => setRenewForm(f => ({ ...f, value: e.target.value }))} />
          </div>
        </Modal>
      )}

      {/* Create AMC Modal */}
      {addOpen && (
        <Modal title="Create AMC" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
          </>}>
          {[['elevatorId','Elevator ID *'],['customer','Customer *'],['value','Value (e.g. ₹2,50,000)']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={addForm[k]} onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>AMC Start *</label>
            <input type="date" value={addForm.amcStart} onChange={e => setAddForm(f => ({ ...f, amcStart: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>AMC End *</label>
            <input type="date" value={addForm.amcEnd} onChange={e => setAddForm(f => ({ ...f, amcEnd: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Type</label>
            <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
              <option>Comprehensive</option>
              <option>Standard</option>
              <option>Basic</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Coverage</label>
            <select value={addForm.coverage} onChange={e => setAddForm(f => ({ ...f, coverage: e.target.value }))}>
              <option>24/7</option>
              <option>Business Hours</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
