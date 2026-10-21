import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getSpareParts, createSparePart, updateSparePart } from '../api/api';

const FALLBACK = [
  { _id:'1', partId:'PART-001', partName:'Door Motor',             category:'Door Components', stock:45,  minStock:20, cost:'₹15,000', supplier:'Tech Motors',     status:'In Stock' },
  { _id:'2', partId:'PART-002', partName:'Controller Unit',        category:'Electronics',     stock:12,  minStock:10, cost:'₹35,000', supplier:'Electrical Pro',  status:'Low Stock' },
  { _id:'3', partId:'PART-003', partName:'Safety Valve',           category:'Safety',          stock:0,   minStock:15, cost:'₹8,500',  supplier:'Safety Tech',     status:'Out of Stock' },
  { _id:'4', partId:'PART-004', partName:'Guide Rail (2m)',        category:'Structural',      stock:120, minStock:50, cost:'₹12,000', supplier:'Steel Supply Co', status:'In Stock' },
  { _id:'5', partId:'PART-005', partName:'Brake Pad Set',          category:'Mechanical',      stock:34,  minStock:15, cost:'₹5,200',  supplier:'Brake Experts',   status:'In Stock' },
  { _id:'6', partId:'PART-006', partName:'Cabin Panel (Stainless)',category:'Cabin',           stock:8,   minStock:12, cost:'₹22,000', supplier:'Stainless Ltd',   status:'Low Stock' },
];

export default function SpareParts() {
  const [list,      setList]      = useState(FALLBACK);
  const [viewItem,  setViewItem]  = useState(null);
  const [editItem,  setEditItem]  = useState(null);
  const [orderItem, setOrderItem] = useState(null);
  const [addOpen,   setAddOpen]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editForm,  setEditForm]  = useState({ stock:'', minStock:'', cost:'', supplier:'' });
  const [orderQty,  setOrderQty]  = useState('');
  const [addForm,   setAddForm]   = useState({ partName:'', category:'', stock:'', minStock:'', cost:'', supplier:'' });

  useEffect(() => {
    getSpareParts().then(r => setList(r.data)).catch(() => {});
  }, []);

  const inStock    = list.filter(p => p.status === 'In Stock').length;
  const lowStock   = list.filter(p => p.status === 'Low Stock').length;
  const outOfStock = list.filter(p => p.status === 'Out of Stock').length;

  const computeStatus = (stock, minStock) => {
    const s = Number(stock); const m = Number(minStock);
    if (s === 0) return 'Out of Stock';
    if (s < m)   return 'Low Stock';
    return 'In Stock';
  };

  const handleEdit = async () => {
    setSaving(true);
    const update = { ...editForm };
    update.status = computeStatus(update.stock, update.minStock);
    try {
      const r = await updateSparePart(editItem._id, update);
      setList(l => l.map(x => x._id === editItem._id ? r.data : x));
    } catch {
      setList(l => l.map(x => x._id === editItem._id ? { ...x, ...update } : x));
    }
    setSaving(false); setEditItem(null);
  };

  const handleOrder = async () => {
    const qty = Number(orderQty);
    if (!qty || qty < 1) return alert('Please enter a valid quantity.');
    setSaving(true);
    const newStock = Number(orderItem.stock) + qty;
    const update = { stock: newStock, status: computeStatus(newStock, orderItem.minStock) };
    try {
      const r = await updateSparePart(orderItem._id, update);
      setList(l => l.map(x => x._id === orderItem._id ? r.data : x));
    } catch {
      setList(l => l.map(x => x._id === orderItem._id ? { ...x, ...update } : x));
    }
    setSaving(false); setOrderItem(null); setOrderQty('');
  };

  const handleAdd = async () => {
    if (!addForm.partName) return alert('Part Name is required.');
    setSaving(true);
    const data = { ...addForm, status: computeStatus(addForm.stock || 0, addForm.minStock || 0) };
    try {
      const r = await createSparePart(data);
      setList(l => [r.data, ...l]);
    } catch {
      setList(l => [{ ...data, _id: Date.now().toString(), partId: `PART-${String(list.length+1).padStart(3,'0')}` }, ...l]);
    }
    setSaving(false); setAddOpen(false);
    setAddForm({ partName:'', category:'', stock:'', minStock:'', cost:'', supplier:'' });
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Spare Parts Management</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ Add New Part</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Items"  value="1,250"     subtitle="All SKUs" />
        <Widget title="In Stock"     value={inStock}   subtitle="Available" type="success" />
        <Widget title="Low Stock"    value={lowStock}  subtitle="Need reorder" type="warning" />
        <Widget title="Out of Stock" value={outOfStock} subtitle="Critical" type="danger" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Part ID</th><th>Part Name</th><th>Category</th>
              <th>Stock</th><th>Min Stock</th><th>Cost/Unit</th>
              <th>Supplier</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p._id}>
                <td>{p.partId}</td>
                <td><strong>{p.partName}</strong></td>
                <td>{p.category}</td>
                <td style={{ color: p.stock === 0 ? '#c62828' : p.stock < p.minStock ? '#e65100' : '#333', fontWeight: p.stock < p.minStock ? 600 : 400 }}>
                  {p.stock}
                </td>
                <td>{p.minStock}</td>
                <td>{p.cost}</td>
                <td>{p.supplier}</td>
                <td><StatusBadge text={p.status} /></td>
                <td>
                  <a className="action-link" style={{ cursor:'pointer' }} onClick={() => setViewItem(p)}>View</a>
                  {' | '}
                  {p.status === 'In Stock' ? (
                    <a className="action-link orange" style={{ cursor:'pointer' }}
                      onClick={() => { setEditItem(p); setEditForm({ stock: p.stock, minStock: p.minStock, cost: p.cost, supplier: p.supplier }); }}>
                      Edit
                    </a>
                  ) : (
                    <a className="action-link orange" style={{ cursor:'pointer' }}
                      onClick={() => { setOrderItem(p); setOrderQty(''); }}>
                      {p.status === 'Out of Stock' ? 'Order Now' : 'Reorder'}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <Modal title="Part Details" onClose={() => setViewItem(null)}
          actions={<button className="btn-save" onClick={() => setViewItem(null)}>Close</button>}>
          {[
            ['Part ID',   viewItem.partId],
            ['Part Name', viewItem.partName],
            ['Category',  viewItem.category],
            ['Stock',     viewItem.stock],
            ['Min Stock', viewItem.minStock],
            ['Cost/Unit', viewItem.cost],
            ['Supplier',  viewItem.supplier],
            ['Status',    viewItem.status],
          ].map(([label, value]) => (
            <div key={label} className="modal-field" style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f0f2f8', padding:'8px 0', marginBottom:0 }}>
              <span style={{ fontSize:13, color:'#888', fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:13, color:'#1e3a5f', fontWeight:600 }}>{value ?? '—'}</span>
            </div>
          ))}
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Part" onClose={() => setEditItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-save" onClick={handleEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>}>
          <div className="modal-field">
            <label>Part Name</label>
            <input value={editItem.partName} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          {[['stock','Stock Quantity'],['minStock','Min Stock'],['cost','Cost/Unit'],['supplier','Supplier']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl}`} value={editForm[k]}
                onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </Modal>
      )}

      {/* Order / Reorder Modal */}
      {orderItem && (
        <Modal title={orderItem.status === 'Out of Stock' ? 'Order Parts' : 'Reorder Parts'} onClose={() => setOrderItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setOrderItem(null)}>Cancel</button>
            <button className="btn-save" onClick={handleOrder} disabled={saving}>{saving ? 'Ordering…' : 'Confirm Order'}</button>
          </>}>
          <div className="modal-field">
            <label>Part</label>
            <input value={`${orderItem.partId} — ${orderItem.partName}`} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Supplier</label>
            <input value={orderItem.supplier} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Current Stock</label>
            <input value={orderItem.stock} readOnly style={{ background:'#f0f2f8' }} />
          </div>
          <div className="modal-field">
            <label>Order Quantity *</label>
            <input type="number" min="1" placeholder="Enter quantity" value={orderQty}
              onChange={e => setOrderQty(e.target.value)} />
          </div>
          <div style={{ marginTop:8, padding:10, background:'#fff8e1', borderRadius:6, fontSize:12, color:'#795548' }}>
            After receiving: stock will be <strong>{Number(orderItem.stock) + (Number(orderQty) || 0)}</strong> units.
          </div>
        </Modal>
      )}

      {/* Add New Part Modal */}
      {addOpen && (
        <Modal title="Add New Part" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Add Part'}</button>
          </>}>
          {[
            ['partName','Part Name *'],['category','Category'],
            ['stock','Stock Quantity'],['minStock','Min Stock'],
            ['cost','Cost/Unit (e.g. ₹15,000)'],['supplier','Supplier'],
          ].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={addForm[k]} onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </Modal>
      )}
    </>
  );
}
