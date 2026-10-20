import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { getSettings, updateSettings, getUsers, createUser, updateUser, deleteUser,
         getRoles, createRole, updateRole, deleteRole, assignRoleToUser } from '../api/api';

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

const ROLES = ['Super Admin', 'Management', 'Project Manager', 'Site Engineer', 'Technician', 'Customer', 'Accounts', 'HR'];
const SCOPE_OPTS = ['none', 'own', 'all'];
const ACTIONS = ['view', 'create', 'edit', 'delete'];
const MODS = [
  'dashboard','notifications','customers','projects','sites',
  'survey','installation','procurement','qa','handover',
  'elevators','maintenance','breakdown','technicians',
  'testing','warranty','spareparts','documents',
  'approvals','reports','auditlogs','settings','users',
];
const MOD_LABEL = { dashboard:'Dashboard', notifications:'Notifications', customers:'Customers', projects:'Projects',
  sites:'Sites', survey:'Survey', installation:'Installation', procurement:'Procurement', qa:'QA',
  handover:'Handover', elevators:'Elevators', maintenance:'Maintenance', breakdown:'Breakdown',
  technicians:'Technicians', testing:'Testing', warranty:'Warranty', spareparts:'Spare Parts',
  documents:'Documents', approvals:'Approvals', reports:'Reports', auditlogs:'Audit Logs',
  settings:'Settings', users:'Users' };
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

  // Role management state
  const [roles,       setRoles]      = useState([]);
  const [selRole,     setSelRole]    = useState(null);  // currently edited role
  const [rolePerms,   setRolePerms]  = useState({});   // local copy of permissions being edited
  const [roleSaving,  setRoleSaving] = useState(false);
  const [newRoleName, setNewRoleName]= useState('');
  const [userRoles,   setUserRoles]  = useState({});   // { userId: roleId }

  const loadRoles = () => getRoles().then(r => setRoles(r.data)).catch(() => {});

  const loadCfg = () => getSettings().then(r => { setCfg(r.data); setForm(r.data); }).catch(() => {});
  const loadUsers = () => getUsers().then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => {
    if (openModal && !['users','roles'].includes(openModal)) loadCfg();
    if (openModal === 'users') { loadUsers(); loadRoles(); }
    if (openModal === 'roles') loadRoles();
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

  // Role management helpers
  const selectRole = (role) => { setSelRole(role); setRolePerms(JSON.parse(JSON.stringify(role.permissions || {}))); };
  const setScopeVal = (mod, action, val) => setRolePerms(p => ({ ...p, [mod]: { ...p[mod], [action]: val } }));
  const saveRole = async () => {
    setRoleSaving(true);
    try {
      const r = await updateRole(selRole._id, { permissions: rolePerms });
      setRoles(rs => rs.map(x => x._id === selRole._id ? r.data : x));
      setSelRole(r.data);
    } catch (e) { alert(e?.response?.data?.message || 'Save failed'); }
    finally { setRoleSaving(false); }
  };
  const addRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const r = await createRole({ name: newRoleName.trim() });
      setRoles(rs => [...rs, r.data]);
      setNewRoleName('');
    } catch (e) { alert(e?.response?.data?.message || 'Failed to create role'); }
  };
  const removeRole = async (role) => {
    if (role.isSystem) return alert('Cannot delete a system role');
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try { await deleteRole(role._id); setRoles(rs => rs.filter(x => x._id !== role._id)); if (selRole?._id === role._id) setSelRole(null); }
    catch (e) { alert(e?.response?.data?.message || 'Failed to delete'); }
  };
  const saveUserRole = async (userId, roleId) => {
    try {
      await assignRoleToUser(userId, roleId || null);
      setUserRoles(u => ({ ...u, [userId]: roleId }));
    } catch (e) { alert(e?.response?.data?.message || 'Failed to assign role'); }
  };

  // Working-days toggle helper
  const toggleDay = (day) => {
    const current = (form.workDays || '').split(',').filter(Boolean);
    const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    setForm(f => ({ ...f, workDays: next.join(',') }));
  };

  const CARDS = [
    { key: 'users',        icon: '👤', title: 'User Management',      desc: 'Manage user accounts, roles, and permissions' },
    { key: 'roles',        icon: '🔐', title: 'Role & Permissions',   desc: 'Define permission matrix: none / own / all per module' },
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
              <Field label="System Role (base access level)">
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
                <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Custom Perms</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.length > 0 ? users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{u.username}</td>
                      <td><StatusBadge text={u.role} /></td>
                      <td>
                        <select style={{ padding: '2px 4px', fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: 4 }}
                          value={userRoles[u._id] ?? (u.roleId?._id || u.roleId || '')}
                          onChange={e => saveUserRole(u._id, e.target.value)}>
                          <option value="">— default —</option>
                          {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                        </select>
                      </td>
                      <td><a className="action-link" onClick={() => openEdit(u)}>Edit</a>{' | '}<a className="action-link orange" onClick={() => handleDel(u)}>Delete</a></td>
                    </tr>
                  )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#999' }}>No users</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {/* ── Role & Permissions ──────────────────────────────────────────── */}
      {openModal === 'roles' && (
        <Modal title="Role & Permission Management" onClose={() => { setOpenModal(null); setSelRole(null); }}
          actions={selRole
            ? [<button key="sv" className="btn-primary" onClick={saveRole} disabled={roleSaving}>{roleSaving ? 'Saving…' : 'Save Permissions'}</button>,
               <button key="bk" className="btn-secondary" onClick={() => setSelRole(null)}>← Back</button>]
            : [<button key="cl" className="btn-secondary" onClick={() => setOpenModal(null)}>Close</button>]
          }>
          {!selRole ? (
            <div>
              {/* Role list */}
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                {roles.map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', border: '1px solid #e8e8e8', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</span>
                      {r.isSystem && <span style={{ marginLeft: 6, fontSize: '0.72rem', background: '#e8f0fe', color: '#1e3a5f', borderRadius: 4, padding: '1px 6px' }}>system</span>}
                      {r.description && <div style={{ fontSize: '0.77rem', color: '#888', marginTop: 1 }}>{r.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-save" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => selectRole(r)}>Edit Perms</button>
                      {!r.isSystem && <button className="btn-cancel" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => removeRole(r)}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Add new role */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1 }} placeholder="New role name…" value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRole()} />
                <button className="btn-save" onClick={addRole}>+ Add Role</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{selRole.name} — Permission Matrix</div>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.75rem' }}>
                <strong>none</strong> = no access &nbsp;|&nbsp; <strong>own</strong> = only assigned records &nbsp;|&nbsp; <strong>all</strong> = all records
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '5px 6px', background: '#f5f7fa', fontWeight: 600 }}>Module</th>
                      {ACTIONS.map(a => (
                        <th key={a} style={{ padding: '5px 8px', background: '#f5f7fa', fontWeight: 600, textTransform: 'capitalize', width: 80 }}>{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODS.map(mod => (
                      <tr key={mod} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '4px 6px', fontWeight: 500 }}>{MOD_LABEL[mod]}</td>
                        {ACTIONS.map(action => (
                          <td key={action} style={{ padding: '3px 4px' }}>
                            <select
                              value={rolePerms[mod]?.[action] || 'none'}
                              onChange={e => setScopeVal(mod, action, e.target.value)}
                              style={{ width: '100%', padding: '2px 4px', fontSize: '0.78rem', border: '1px solid #ddd', borderRadius: 4,
                                background: rolePerms[mod]?.[action] === 'all' ? '#e8f5e9' : rolePerms[mod]?.[action] === 'own' ? '#fff8e1' : '#fafafa' }}>
                              {SCOPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
