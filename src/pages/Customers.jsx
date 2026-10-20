import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getCustomers, createCustomer, updateCustomer, createCustomerAppLogin } from '../api/api';

const EMPTY_LOGIN = { name: '', email: '', password: '', role: 'Customer Admin' };

const EMPTY = { companyName: '', contactPerson: '', email: '', phone: '', gstNumber: '', address: '' };

const FALLBACK = [
  { _id: '1', customerId: 'CUST-001', companyName: 'ABC Corporation',     contactPerson: 'Raj Kumar',    email: 'raj@abc.com',      phone: '98765-43210', sites: 3, status: 'Active' },
  { _id: '2', customerId: 'CUST-002', companyName: 'XYZ Limited',         contactPerson: 'Priya Singh',  email: 'priya@xyz.com',    phone: '99876-54321', sites: 5, status: 'Active' },
  { _id: '3', customerId: 'CUST-003', companyName: 'Tech Solutions',       contactPerson: 'Amit Patel',   email: 'amit@tech.com',    phone: '97654-32109', sites: 2, status: 'Pending' },
  { _id: '4', customerId: 'CUST-004', companyName: 'Central Retail',       contactPerson: 'Anita Verma',  email: 'anita@retail.com', phone: '96543-21098', sites: 4, status: 'Active' },
  { _id: '5', customerId: 'CUST-005', companyName: 'Metro Developments',   contactPerson: 'Vinod Sharma', email: 'vinod@metro.com',  phone: '95432-10987', sites: 6, status: 'Active' },
  { _id: '6', customerId: 'CUST-006', companyName: 'Green Valley Builders',contactPerson: 'Suresh Nair',  email: 'suresh@green.com', phone: '94321-09876', sites: 2, status: 'Active' },
];

export default function Customers() {
  const [list,       setList]       = useState(FALLBACK);
  const [viewItem,   setViewItem]   = useState(null);
  const [editItem,   setEditItem]   = useState(null);
  const [addOpen,    setAddOpen]    = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [loginFor,   setLoginFor]   = useState(null);   // customer to create app login for
  const [loginForm,  setLoginForm]  = useState(EMPTY_LOGIN);
  const [loginSaving,setLoginSaving]= useState(false);
  const [loginMsg,   setLoginMsg]   = useState('');

  useEffect(() => {
    getCustomers().then(r => setList(r.data)).catch(() => {});
  }, []);

  const active  = list.filter(c => c.status === 'Active').length;
  const pending = list.filter(c => c.status === 'Pending').length;

  const handleAdd = async () => {
    try {
      const r = await createCustomer(form);
      setList(l => [r.data, ...l]);
    } catch { alert('Added (offline mode)'); }
    setAddOpen(false);
    setForm(EMPTY);
  };

  const openLoginModal = (c) => {
    setLoginFor(c);
    setLoginForm(EMPTY_LOGIN);
    setLoginMsg('');
  };

  const handleCreateLogin = async () => {
    if (!loginForm.name || !loginForm.email || !loginForm.password) {
      setLoginMsg('Name, email and password are required.');
      return;
    }
    setLoginSaving(true);
    setLoginMsg('');
    try {
      await createCustomerAppLogin({
        name: loginForm.name,
        email: loginForm.email,
        password: loginForm.password,
        role: loginForm.role,
        customerId: loginFor.customerId,
        companyName: loginFor.companyName,
      });
      setLoginMsg('✓ App login created! The customer can now log in to elevatorX.');
      setLoginSaving(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create login.';
      if (msg.toLowerCase().includes('already')) {
        setLoginMsg('⚠ This email is already registered. Use a different email address, or ask the customer to use their existing login.');
      } else {
        setLoginMsg(msg);
      }
      setLoginSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      const r = await updateCustomer(editItem._id, editItem);
      setList(l => l.map(x => x._id === editItem._id ? r.data : x));
    } catch { alert('Saved (offline mode)'); }
    setEditItem(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom: 0 }}>Customer Management</div>
        <button className="btn-add" onClick={() => { setForm(EMPTY); setAddOpen(true); }}>
          + Add New Customer
        </button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Customers" value={list.length} subtitle="Active organizations" />
        <Widget title="Active"  value={active}  subtitle="Operational" type="success" />
        <Widget title="Pending" value={pending} subtitle="Awaiting approval" type="warning" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Company Name</th><th>Contact</th>
              <th>Email</th><th>Phone</th><th>Sites</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c._id}>
                <td>{c.customerId}</td>
                <td>{c.companyName}</td>
                <td>{c.contactPerson}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.sites}</td>
                <td><StatusBadge text={c.status} /></td>
                <td>
                  <a className="action-link" onClick={() => setViewItem(c)}>View</a>
                  {' | '}
                  <a className="action-link orange" onClick={() => setEditItem({ ...c })}>Edit</a>
                  {' | '}
                  <a className="action-link" style={{ color: '#2563eb' }} onClick={() => openLoginModal(c)}>App Login</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewItem && (
        <Modal title="Customer Details" onClose={() => setViewItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setViewItem(null)}>Close</button>
            <button className="btn-save" onClick={() => { setEditItem({ ...viewItem }); setViewItem(null); }}>Edit</button>
          </>}>
          <div className="modal-info">
            {[['Customer ID', viewItem.customerId], ['Company Name', viewItem.companyName],
              ['Contact Person', viewItem.contactPerson], ['Email', viewItem.email],
              ['Phone', viewItem.phone], ['Total Sites', viewItem.sites],
              ['Status', viewItem.status]].map(([l, v]) => (
              <div key={l} className="modal-info-row">
                <span className="modal-info-label">{l}:</span>
                <span className="modal-info-value">
                  {l === 'Status' ? <StatusBadge text={v} /> : v}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Customer" onClose={() => setEditItem(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-save" onClick={handleSave}>Save Changes</button>
          </>}>
          {['companyName','contactPerson','email','phone','gstNumber'].map(k => (
            <div key={k} className="modal-field">
              <label>{k.replace(/([A-Z])/g,' $1').trim()}</label>
              <input value={editItem[k] || ''} onChange={e => setEditItem(i => ({ ...i, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Notes</label>
            <textarea value={editItem.notes || ''} onChange={e => setEditItem(i => ({ ...i, notes: e.target.value }))} />
          </div>
        </Modal>
      )}

      {/* App Login Modal */}
      {loginFor && (
        <Modal title={`Create App Login — ${loginFor.companyName}`} onClose={() => setLoginFor(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setLoginFor(null)}>
              {loginMsg.startsWith('✓') ? 'Close' : 'Cancel'}
            </button>
            {!loginMsg.startsWith('✓') && (
              <button className="btn-save" onClick={handleCreateLogin} disabled={loginSaving}>
                {loginSaving ? 'Creating…' : 'Create Login'}
              </button>
            )}
          </>}>
          {loginMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 14,
              background: loginMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
              color: loginMsg.startsWith('✓') ? '#166534' : '#991b1b',
              fontSize: 13, border: `1px solid ${loginMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`
            }}>{loginMsg}</div>
          )}
          <div className="modal-field">
            <label>Customer</label>
            <input value={`${loginFor.companyName} (${loginFor.customerId})`} disabled style={{ background: '#f5f7fa' }} />
          </div>
          <div className="modal-field">
            <label>Full Name *</label>
            <input placeholder="Contact person name"
              value={loginForm.name} onChange={e => setLoginForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Email Address *</label>
            <input type="email" placeholder="Login email"
              value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Password *</label>
            <input type="password" placeholder="Set a password"
              value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label>Role</label>
            <select value={loginForm.role} onChange={e => setLoginForm(f => ({ ...f, role: e.target.value }))}>
              <option>Customer Admin</option>
              <option>Facility Manager</option>
              <option>Viewer</option>
            </select>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {addOpen && (
        <Modal title="Add New Customer" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Add Customer</button>
          </>}>
          {[['companyName','Company Name *'],['contactPerson','Contact Person *'],
            ['email','Email *'],['phone','Phone *'],['gstNumber','GST Number']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Address</label>
            <textarea placeholder="Enter company address"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </Modal>
      )}
    </>
  );
}
