import { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getSites, createSite, updateSite } from '../api/api';

const STATUSES = ['Operational', 'Under Installation', 'Maintenance', 'Inactive'];

const EMPTY_FORM = {
  siteName: '', customer: '', address: '', city: '', location: '', elevators: 0, status: 'Operational',
};

const inp = { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 };

const FALLBACK = [
  { _id:'1', siteId:'SITE-001', siteName:'ABC Tower',    location:'Mumbai',    customer:'ABC Corp',      elevators:3, address:'123 Business Park, Mumbai',       status:'Operational' },
  { _id:'2', siteId:'SITE-002', siteName:'XYZ Complex',  location:'Bangalore', customer:'XYZ Ltd',       elevators:5, address:'456 Tech Avenue, Bangalore',       status:'Operational' },
  { _id:'3', siteId:'SITE-003', siteName:'Tech Park',    location:'Pune',      customer:'Tech Solutions', elevators:2, address:'789 Innovation Hub, Pune',         status:'Under Installation' },
  { _id:'4', siteId:'SITE-004', siteName:'Central Mall', location:'Delhi',     customer:'Central Retail', elevators:4, address:'321 Shopping Complex, Delhi',      status:'Operational' },
  { _id:'5', siteId:'SITE-005', siteName:'Metro Heights',location:'Hyderabad', customer:'Metro Dev',      elevators:6, address:'654 Residential Tower, Hyderabad', status:'Maintenance' },
];

export default function Sites() {
  const [list, setList]         = useState(FALLBACK);
  const [selected, setSelected] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const load = () => getSites().then(r => setList(r.data.length ? r.data : FALLBACK)).catch(() => {});
  useEffect(() => { load(); }, []);

  const operational = list.filter(s => s.status === 'Operational').length;
  const installing  = list.filter(s => s.status === 'Under Installation').length;
  const maintenance = list.filter(s => s.status === 'Maintenance').length;

  const openEdit = (site) => {
    setForm({
      siteName:  site.siteName  || '',
      customer:  site.customer  || '',
      address:   site.address   || '',
      city:      site.city      || '',
      location:  site.location  || '',
      elevators: site.elevators || 0,
      status:    site.status    || 'Operational',
    });
    setShowEdit(site);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowAdd(true);
  };

  const handleCreate = async () => {
    if (!form.siteName) return alert('Site name is required');
    if (!form.customer) return alert('Customer is required');
    setSaving(true);
    try {
      await createSite(form);
      await load();
      setShowAdd(false);
    } catch (e) { alert(e.response?.data?.message || 'Error creating site'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateSite(showEdit._id, form);
      await load();
      setShowEdit(null);
    } catch (e) { alert(e.response?.data?.message || 'Error updating site'); }
    finally { setSaving(false); }
  };

  const Field = ({ label, fkey, type = 'text' }) => (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={form[fkey]}
        onChange={e => setForm(f => ({ ...f, [fkey]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={inp} />
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="section-title" style={{ marginBottom: 0 }}>Site Management</div>
        <button className="btn-add" onClick={openAdd}>+ Add New Site</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Sites"        value={list.length} subtitle="All locations" />
        <Widget title="Operational"        value={operational} subtitle={`${Math.round(operational / list.length * 100) || 0}%`} type="success" />
        <Widget title="Under Installation" value={installing}  subtitle="In progress" type="warning" />
        <Widget title="Maintenance"        value={maintenance} subtitle="Scheduled" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Site ID</th><th>Site Name</th><th>Location</th>
              <th>Customer</th><th>Elevators</th><th>Address</th>
              <th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s._id}>
                <td>{s.siteId || '-'}</td>
                <td><strong>{s.siteName}</strong></td>
                <td>{s.location || s.city || '-'}</td>
                <td>{s.customer}</td>
                <td>{s.elevators}</td>
                <td>{s.address || '-'}</td>
                <td><StatusBadge text={s.status} /></td>
                <td>
                  <button className="btn-action" onClick={() => setSelected(s)}>View</button>
                  {' '}
                  <button className="btn-action orange" onClick={() => openEdit(s)}>
                    {s.status === 'Under Installation' ? 'Track' :
                     s.status === 'Maintenance' ? 'Schedule' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selected && (
        <Modal title={`Site — ${selected.siteName}`} onClose={() => setSelected(null)}
          actions={[
            <button key="e" className="btn-primary" onClick={() => { openEdit(selected); setSelected(null); }}>Edit Site</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              ['Site ID',   selected.siteId   || '-'],
              ['Site Name', selected.siteName],
              ['Customer',  selected.customer],
              ['Location',  selected.location || selected.city || '-'],
              ['Address',   selected.address  || '-'],
              ['Elevators', selected.elevators],
              ['Status',    <StatusBadge key="s" text={selected.status} />],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.78rem', color: '#999', marginBottom: '2px' }}>{k}</div>
                <div style={{ fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title={`Edit — ${showEdit.siteName}`} onClose={() => setShowEdit(null)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowEdit(null)}>Cancel</button>,
          ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Site Name *" fkey="siteName" />
            <Field label="Customer *"  fkey="customer"  />
            <Field label="City"        fkey="city"       />
            <Field label="Location"    fkey="location"   />
            <Field label="No. of Elevators" fkey="elevators" type="number" />
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Address" fkey="address" />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Site" onClose={() => setShowAdd(false)}
          actions={[
            <button key="s" className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Add Site'}</button>,
            <button key="c" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>,
          ]}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Site Name *" fkey="siteName" />
            <Field label="Customer *"  fkey="customer"  />
            <Field label="City"        fkey="city"       />
            <Field label="Location"    fkey="location"   />
            <Field label="No. of Elevators" fkey="elevators" type="number" />
            <div>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Address" fkey="address" />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
