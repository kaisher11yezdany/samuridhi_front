import { useState, useEffect } from 'react';
import { getUsers, assignUsers } from '../api/api';

export default function AssignUsers({ module, docId, assignedUsers = [], onUpdate, onClose }) {
  const [users,    setUsers]    = useState([]);
  const [selected, setSelected] = useState(assignedUsers.map(u => (u._id || u)));
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getUsers().then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const toggle = id => setSelected(s =>
    s.includes(id) ? s.filter(x => x !== id) : [...s, id]
  );

  const save = async () => {
    setSaving(true);
    try {
      const r = await assignUsers(module, docId, selected);
      onUpdate?.(r.data);
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to assign');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
        Select team members to assign to this record:
      </p>
      <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e8e8e8', borderRadius: 8, padding: '0.5rem' }}>
        {users.length === 0 && <div style={{ color: '#999', padding: '0.5rem' }}>Loading users…</div>}
        {users.map(u => (
          <label key={u._id} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.5rem 0.6rem', cursor: 'pointer', borderRadius: 6,
            background: selected.includes(u._id) ? '#f0f5ff' : 'transparent',
          }}>
            <input
              type="checkbox"
              checked={selected.includes(u._id)}
              onChange={() => toggle(u._id)}
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{u.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#999' }}>{u.role}</div>
            </div>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className="btn-save" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Assign'}
        </button>
      </div>
    </div>
  );
}
