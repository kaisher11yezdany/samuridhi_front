import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getProcurement, createPO, updatePO } from '../api/api';

const EMPTY = { vendor:'', project:'', items:'', amount:'', orderDate:'', deliveryDate:'' };

export default function Procurement() {
  const [pos, setPOs]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => getProcurement().then(r => setPOs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const approved  = pos.filter(p => p.status === 'Approved').length;
  const pending   = pos.filter(p => ['Pending','Draft'].includes(p.status)).length;
  const delivered = pos.filter(p => p.status === 'Delivered').length;
  const inTransit = pos.filter(p => p.status === 'In Transit').length;

  const handleAdd = async () => {
    if (!form.vendor) return;
    setSaving(true);
    try { await createPO(form); await load(); setShowAdd(false); setForm(EMPTY); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (po) => {
    try { await updatePO(po._id, { status: 'Approved' }); await load(); setSelected(null); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total POs"       value={pos.length}  subtitle="Purchase orders" />
        <Widget title="Approved"        value={approved}    subtitle="Authorized POs"    type="success" />
        <Widget title="Pending / Draft" value={pending}     subtitle="Awaiting approval" type="warning" />
        <Widget title="In Transit"      value={inTransit}   subtitle="On the way"        type="warning" />
        <Widget title="Delivered"       value={delivered}   subtitle="Received"          type="success" />
      </div>

      <div className="section-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        Purchase Orders
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Create PO</button>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>PO Number</th><th>Vendor</th><th>Items</th><th>Amount</th>
              <th>Order Date</th><th>Delivery Date</th><th>Project</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pos.length > 0
              ? pos.map(po => (
                <tr key={po._id}>
                  <td><strong>{po.poNumber}</strong></td>
                  <td>{po.vendor}</td>
                  <td style={{ maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{po.items}</td>
                  <td><strong>{po.amount}</strong></td>
                  <td>{po.orderDate || '-'}</td>
                  <td>{po.deliveryDate || '-'}</td>
                  <td>{po.project || '-'}</td>
                  <td><StatusBadge text={po.status} /></td>
                  <td><button className="btn-action" onClick={() => setSelected(po)}>View</button></td>
                </tr>
              ))
              : <tr><td colSpan={9} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No purchase orders yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={`Purchase Order — ${selected.poNumber}`} onClose={() => setSelected(null)}
          actions={[
            selected.status === 'Pending' && <button key="a" className="btn-primary" onClick={() => handleApprove(selected)}>Approve PO</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ].filter(Boolean)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {[['PO Number', selected.poNumber], ['Vendor', selected.vendor],
              ['Project', selected.project || '-'], ['Order Date', selected.orderDate || '-'],
              ['Expected Delivery', selected.deliveryDate || '-'], ['Amount', selected.amount || '-']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:'0.78rem', color:'#999', marginBottom:'2px' }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'1rem' }}>
            <div style={{ fontWeight:600, marginBottom:'6px' }}>Items Ordered</div>
            <div style={{ background:'#f8f9fa', padding:'0.75rem', borderRadius:'6px' }}>{selected.items || '-'}</div>
          </div>
          <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
            <span>Status:</span><StatusBadge text={selected.status} />
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Create Purchase Order" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Submit PO'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>
            {[['Vendor Name','vendor','text'],['Project','project','text'],['Items Description','items','text'],['Estimated Amount','amount','text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
            {[['Order Date','orderDate'],['Expected Delivery Date','deliveryDate']].map(([label, key]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type="date" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
