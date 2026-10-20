import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { getSettings, updateSettings, getUsers, createUser, updateUser, deleteUser } from '../api/api';

const inp  = { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.9rem' };
const lbl  = { display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500, color: '#444' };
const sec  = { fontWeight: 600, color: '#1e3a5f', fontSize: '0.88rem', margin: '1rem 0 0.5rem', borderBottom: '1px solid #eee', paddingBottom: '4px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };

function Field({ label: l, children }) {
  return <div><label style={lbl}>{l}</label>{children}</div>;
}
function TextInp({ k, form, set, type = 'text', min }) {
  return <input style={inp} type={type} min={min} value={form[k] ?? ''} onChange={e => set(f => ({ ...f, [k]: type === 'number' ? Number(e.target.value) : e.target.value }))} />;
}
function Toggle({ k, form, set, label: l, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
      <div>
        <div style={{ fontWeight: 500 }}>{l}</div>
        {sub && <div style={{ fontSize: '0.82rem', color: '#888' }}>{sub}</div>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
        <input type="checkbox" checked={!!form[k]} onChange={e => set(f => ({ ...f, [k]: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: form[k] ? '#1e3a5f' : '#ccc', transition: '0.3s' }}>
          <span style={{ position: 'absolute', height: '18px', width: '18px', left: form[k] ? '23px' : '3px', bottom: '3px', background: 'white', borderRadius: '50%', transition: '0.3s' }} />
        </span>
      </label>
    </div>
  );
}

const ROLES = ['Super Admin', 'Admin', 'Manager', 'Project Manager', 'Technician', 'Viewer'];
const EMPTY_USER = { name: '', username: '', email: '', role: 'Technician', password: '' };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'UTC', 'Asia/Colombo'];

export default function Settings() {
  const [openModal, setOpenModal] = useState(null);
  const [cfg, setCfg]             = useState({});
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);

  const [users, setUsers]         = useState([]);
  const [userForm, setUserForm]   = useState(EMPTY_USER);
  const [editUser, setEditUser]   = useState(null);
  const [showUF, setShowUF]       = useState(false);
  const [uSaving, setUSaving]     = useState(false);

  const loadCfg = () => getSettings().then(r => { setCfg(r.data); setForm(r.data); }).catch(() => {});
  const loadUsers = () => getUsers().then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => {
    if (openModal && openModal !== 'users') loadCfg();
    if (openModal === 'users') loadUsers();
  }, [openModal]);

  const saveCfg = async () => {
    setSaving(true);
    try { const r = await updateSettings(form); setCfg(r.data); setForm(r.data); setOpenModal(null); }
    catch { alert('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const SaveCancel = () => (
    <>
      <button className="btn-primary" onClick={saveCfg} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      <button className="btn-secondary" onClick={() => setOpenModal(null)}>Cancel</button>
    </>
  );

  // ── User helpers ─────────────────────────────────────────────────────────
  const openAdd  = () => { setEditUser(null); setUserForm(EMPTY_USER); setShowUF(true); };
  const openEdit = (u) => { setEditUser(u); setUserForm({ name: u.name, username: u.username, email: u.email || '', role: u.role, password: '' }); setShowUF(true); };
  const handleDel = async (u) => {
    if (!window.confirm(`Delete "${u.name}"?`)) return;
    try { await deleteUser(u._id); setUsers(p => p.filter(x => x._id !== u._id)); }
    catch { alert('Delete failed'); }
  };
  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.username) return alert('Name and username required');
    setUSaving(true);
    try {
      if (editUser) {
        const payload = userForm.password ? userForm : (({ password, ...rest }) => rest)(userForm);
        const r = await updateUser(editUser._id, payload);
        setUsers(p => p.map(x => x._id === editUser._id ? r.data : x));
      } else {
        if (!userForm.password) return alert('Password required for new users');
        const r = await createUser(userForm);
        setUsers(p => [r.data, ...p]);
      }
      setShowUF(false);
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    finally { setUSaving(false); }
  };

  // Working-days toggle helper
  const toggleDay = (day) => {
    const current = (form.workDays || '').split(',').filter(Boolean);
    const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    setForm(f => ({ ...f, workDays: next.join(',') }));
  };

  const CARDS = [
    { key: 'users',        icon: '👤', title: 'User Management',      desc: 'Manage user accounts, roles, and permissions' },
    { key: 'security',     icon: '🔒', title: 'Security & SLA',        desc: 'SLA response times per priority level' },
    { key: 'bizHours',     icon: '🕐', title: 'Business Hours',        desc: 'Working hours and days for SLA calculation' },
    { key: 'escalation',   icon: '🚨', title: 'Escalation Rules',      desc: 'Auto-escalate breached tickets to management' },
    { key: 'amc',          icon: '📋', title: 'AMC & Contract',        desc: 'Default AMC duration, renewal reminders, warranty' },
    { key: 'billing',      icon: '🧾', title: 'Billing & GST',         desc: 'GST number, invoice prefix, payment terms' },
    { key: 'notifications',icon: '📧', title: 'Notifications',         desc: 'Email and SMS alert preferences' },
    { key: 'system',       icon: '⚙️', title: 'System Configuration',  desc: 'Company name, email, phone' },
  ];

  return (
    <>
      <div className="section-title">System Settings</div>
      <div className="settings-grid">
        {CARDS.map(c => (
          <div key={c.key} className="settings-card">
            <h3>{c.icon} {c.title}</h3>
            <p>{c.desc}</p>
            <button onClick={() => setOpenModal(c.key)}>Configure</button>
          </div>
        ))}
      </div>

      {/* ── User Management ─────────────────────────────────────────────── */}
      {openModal === 'users' && (
        <Modal title="User Management" onClose={() => { setOpenModal(null); setShowUF(false); }}
          actions={showUF
            ? [<button key="s" className="btn-primary" onClick={handleSaveUser} disabled={uSaving}>{uSaving ? 'Saving…' : (editUser ? 'Update' : 'Create')}</button>,
               <button key="b" className="btn-secondary" onClick={() => setShowUF(false)}>Back</button>]
            : [<button key="a" className="btn-primary" onClick={openAdd}>+ Add User</button>,
               <button key="c" className="btn-secondary" onClick={() => setOpenModal(null)}>Close</button>]
          }>
          {showUF ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={sec}>{editUser ? `Edit — ${editUser.username}` : 'New User'}</div>
              {[['Full Name','name','text'],['Username','username','text'],['Email','email','email']].map(([l,k,t]) => (
                <Field key={k} label={l}><input style={inp} type={t} value={userForm[k]} onChange={e => setUserForm(f => ({ ...f, [k]: e.target.value }))} /></Field>
              ))}
              <Field label="Role">
                <select style={inp} value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label={editUser ? 'New Password (blank = keep current)' : 'Password'}>
                <input style={inp} type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} />
              </Field>
            </div>
          ) : (
            <div className="data-table" style={{ maxHeight: 380, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.length > 0 ? users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{u.username}</td>
                      <td><StatusBadge text={u.role} /></td>
                      <td><a className="action-link" onClick={() => openEdit(u)}>Edit</a>{' | '}<a className="action-link orange" onClick={() => handleDel(u)}>Delete</a></td>
                    </tr>
                  )) : <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#999' }}>No users</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ── Security & SLA ──────────────────────────────────────────────── */}
      {openModal === 'security' && (
        <Modal title="Security & SLA Settings" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={sec}>SLA Response Hours by Priority</div>
            <div style={grid2}>
              <Field label="Critical (hours)"><TextInp k="slaHoursCritical" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="High (hours)"><TextInp k="slaHoursHigh" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="Medium (hours)"><TextInp k="slaHoursMedium" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="Low (hours)"><TextInp k="slaHoursLow" form={form} set={setForm} type="number" min={1} /></Field>
            </div>
            <div style={sec}>Maintenance</div>
            <Field label="Default maintenance interval (days)"><TextInp k="maintenanceInterval" form={form} set={setForm} type="number" min={1} /></Field>
            <div style={sec}>SLA Calculation Mode</div>
            <Field label="Count SLA hours using">
              <select style={inp} value={form.slaCalcMode || 'business_hours'} onChange={e => setForm(f => ({ ...f, slaCalcMode: e.target.value }))}>
                <option value="business_hours">Business hours only</option>
                <option value="24x7">24 × 7 (calendar hours)</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {/* ── Business Hours ───────────────────────────────────────────────── */}
      {openModal === 'bizHours' && (
        <Modal title="Business Hours" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={sec}>Working Hours</div>
            <div style={grid2}>
              <Field label="Start time"><TextInp k="workStartTime" form={form} set={setForm} type="time" /></Field>
              <Field label="End time"><TextInp k="workEndTime" form={form} set={setForm} type="time" /></Field>
            </div>
            <div style={sec}>Working Days</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DAYS.map(day => {
                const active = (form.workDays || '').split(',').includes(day);
                return (
                  <button key={day} onClick={() => toggleDay(day)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontSize: '0.85rem',
                      background: active ? '#1e3a5f' : 'white', color: active ? 'white' : '#555', borderColor: active ? '#1e3a5f' : '#ddd' }}>
                    {day}
                  </button>
                );
              })}
            </div>
            <div style={sec}>Timezone</div>
            <Field label="Server timezone">
              <select style={inp} value={form.timezone || 'Asia/Kolkata'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {/* ── Escalation Rules ─────────────────────────────────────────────── */}
      {openModal === 'escalation' && (
        <Modal title="Escalation Rules" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ background: '#fff8e1', border: '1px solid #eda100', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#7a5200' }}>
              When a ticket exceeds its SLA time without resolution, the system auto-escalates to the configured contacts.
            </div>
            <div style={sec}>Level 1 Escalation (First breach)</div>
            <div style={grid2}>
              <Field label="Escalate after (hours past SLA)"><TextInp k="escalationL1Hours" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="Notify email"><TextInp k="escalationL1Email" form={form} set={setForm} type="email" /></Field>
            </div>
            <div style={sec}>Level 2 Escalation (Critical breach)</div>
            <div style={grid2}>
              <Field label="Escalate after (hours past SLA)"><TextInp k="escalationL2Hours" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="Notify email"><TextInp k="escalationL2Email" form={form} set={setForm} type="email" /></Field>
            </div>
            <div style={sec}>SMS Alerts</div>
            <Toggle k="escalationSmsAlert" form={form} set={setForm} label="SMS on escalation" sub="Send SMS to technician's supervisor on breach" />
          </div>
        </Modal>
      )}

      {/* ── AMC & Contract Settings ─────────────────────────────────────── */}
      {openModal === 'amc' && (
        <Modal title="AMC & Contract Settings" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={sec}>AMC Defaults</div>
            <div style={grid2}>
              <Field label="Default AMC duration (months)"><TextInp k="amcDefaultDurationMonths" form={form} set={setForm} type="number" min={1} /></Field>
              <Field label="Renewal reminder (days before expiry)"><TextInp k="amcRenewalReminderDays" form={form} set={setForm} type="number" min={1} /></Field>
            </div>
            <Field label="Grace period after expiry (days)"><TextInp k="amcGracePeriodDays" form={form} set={setForm} type="number" min={0} /></Field>
            <Toggle k="autoRenewAMC" form={form} set={setForm} label="Auto-renew AMC contracts" sub="Automatically create renewal reminders when AMC expires" />
            <div style={sec}>Warranty</div>
            <Field label="Default warranty period (months)"><TextInp k="warrantyDefaultMonths" form={form} set={setForm} type="number" min={1} /></Field>
          </div>
        </Modal>
      )}

      {/* ── Billing & GST ───────────────────────────────────────────────── */}
      {openModal === 'billing' && (
        <Modal title="Billing & GST Settings" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={sec}>GST & Tax</div>
            <div style={grid2}>
              <Field label="GST Number"><TextInp k="gstNumber" form={form} set={setForm} /></Field>
              <Field label="Currency Symbol"><TextInp k="currencySymbol" form={form} set={setForm} /></Field>
            </div>
            <div style={sec}>Invoice</div>
            <div style={grid2}>
              <Field label="Invoice prefix (e.g. INV)"><TextInp k="invoicePrefix" form={form} set={setForm} /></Field>
              <Field label="Payment terms (days)"><TextInp k="paymentTermsDays" form={form} set={setForm} type="number" min={0} /></Field>
            </div>
            <div style={sec}>Bank Details</div>
            <Field label="Bank name"><TextInp k="bankName" form={form} set={setForm} /></Field>
            <div style={grid2}>
              <Field label="Account number"><TextInp k="bankAccountNumber" form={form} set={setForm} /></Field>
              <Field label="IFSC code"><TextInp k="bankIFSC" form={form} set={setForm} /></Field>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Notifications ───────────────────────────────────────────────── */}
      {openModal === 'notifications' && (
        <Modal title="Notification Preferences" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Toggle k="emailNotifications" form={form} set={setForm} label="Email Notifications" sub="Send alerts and reports via email" />
            <Toggle k="smsNotifications"   form={form} set={setForm} label="SMS Notifications"   sub="Send critical alerts via SMS" />
          </div>
        </Modal>
      )}

      {/* ── System Configuration ─────────────────────────────────────────── */}
      {openModal === 'system' && (
        <Modal title="System Configuration" onClose={() => setOpenModal(null)} actions={[<SaveCancel key="sc" />]}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={sec}>Company Information</div>
            <Field label="Company Name"><TextInp k="companyName" form={form} set={setForm} /></Field>
            <div style={grid2}>
              <Field label="Email"><TextInp k="companyEmail" form={form} set={setForm} type="email" /></Field>
              <Field label="Phone"><TextInp k="companyPhone" form={form} set={setForm} /></Field>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
