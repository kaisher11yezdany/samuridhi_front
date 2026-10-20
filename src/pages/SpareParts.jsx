import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getSpareParts } from '../api/api';

const FALLBACK = [
  { _id:'1', partId:'PART-001', partName:'Door Motor',            category:'Door Components', stock:45,  minStock:20, cost:'₹15,000', supplier:'Tech Motors',    status:'In Stock' },
  { _id:'2', partId:'PART-002', partName:'Controller Unit',       category:'Electronics',     stock:12,  minStock:10, cost:'₹35,000', supplier:'Electrical Pro', status:'Low Stock' },
  { _id:'3', partId:'PART-003', partName:'Safety Valve',          category:'Safety',          stock:0,   minStock:15, cost:'₹8,500',  supplier:'Safety Tech',    status:'Out of Stock' },
  { _id:'4', partId:'PART-004', partName:'Guide Rail (2m)',       category:'Structural',      stock:120, minStock:50, cost:'₹12,000', supplier:'Steel Supply Co',status:'In Stock' },
  { _id:'5', partId:'PART-005', partName:'Brake Pad Set',         category:'Mechanical',      stock:34,  minStock:15, cost:'₹5,200',  supplier:'Brake Experts',  status:'In Stock' },
  { _id:'6', partId:'PART-006', partName:'Cabin Panel (Stainless)',category:'Cabin',          stock:8,   minStock:12, cost:'₹22,000', supplier:'Stainless Ltd',  status:'Low Stock' },
];

export default function SpareParts() {
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    getSpareParts().then(r => setList(r.data)).catch(() => {});
  }, []);

  const inStock    = list.filter(p => p.status === 'In Stock').length;
  const lowStock   = list.filter(p => p.status === 'Low Stock').length;
  const outOfStock = list.filter(p => p.status === 'Out of Stock').length;

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Spare Parts Management</div>
        <button className="btn-add">+ Add New Part</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Items"   value="1,250"     subtitle="All SKUs" />
        <Widget title="In Stock"      value={inStock}   subtitle="Available" type="success" />
        <Widget title="Low Stock"     value={lowStock}  subtitle="Need reorder" type="warning" />
        <Widget title="Out of Stock"  value={outOfStock}subtitle="Critical" type="danger" />
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
                  <a className="action-link">View</a>
                  {' | '}
                  <a className="action-link orange">
                    {p.status === 'Out of Stock' ? 'Order Now' :
                     p.status === 'Low Stock'    ? 'Reorder' : 'Edit'}
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
