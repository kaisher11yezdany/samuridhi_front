import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getApprovals, updateApproval } from '../api/api';

const TYPES = ['All','Purchase Order','Leave Request','Expense Claim','Contract Change','Customer Discount','Other'];

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [activeType, setActive]   = useState('All');
  const [remark, setRemark]       = useState('');
  const [saving, setSaving]       = useState(false);

  const load = () => getApprovals().then(r => setApprovals(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const pending  = approvals.filter(a => a.status === 'Pending').length;
  const inReview = approvals.filter(a => a.status === 'In Review').length;
  const approved = approvals.filter(a => a.status === 'Approved').length;
  const rejected = approvals.filter(a => a.status === 'Rejected').length;

  const filtered = approvals.filter(a => activeType === 'All' || a.type === activeType);

  const handleDecision = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateApproval(selected._id, { status, remarks: remark });
      await load();
      setSelected(null);
      setRemark('');
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Pending Action" value={pending}  subtitle="Needs your approval"  type="warning" />
        <Widget title="In Review"      value={inReview} subtitle="Under consideration"   type="warning" />
        <Widget title="Approved"       value={approved} subtitle="This month"            type="success" />
        <Widget title="Rejected"       value={rejected} subtitle="Declined"              type="danger" />
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setActive(t)}
            style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'0.85rem',
              background: activeType === t ? '#1e3a5f' : 'white',
              color: activeType === t ? 'white' : '#555',
              borderColor: activeType === t ? '#1e3a5f' : '#ddd' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Approval ID</th><th>Type</th><th>Reference</th><th>Description</th>
              <th>Requested By</th><th>Priority</th><th>Current Level</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0
              ? filtered.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.approvalId}</strong></td>
                  <td>{a.type}</td>
                  <td>{a.reference || '-'}</td>
                  <td style={{ maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description}</td>
                  <td>{a.requestedBy || '-'}</td>
                  <td><StatusBadge text={a.priority} /></td>
                  <td style={{ fontSize:'0.8rem', color:'#666' }}>{a.currentLevel || '-'}</td>
                  <td><StatusBadge text={a.status} /></td>
                  <td>
                    <button className="btn-action" onClick={() => { setSelected(a); setRemark(''); }}>
                      {['Pending','In Review'].includes(a.status) ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))
              : <tr><td colSpan={9} style={{ textAlign:'center', padding:'2rem', color:'#999' }}>No approvals yet</td></tr>
            }
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={`Approval Review — ${selected.approvalId}`} onClose={() => { setSelected(null); setRemark(''); }}
          actions={[
            ['Pending','In Review'].includes(selected.status) && (
              <button key="approve" className="btn-primary" style={{ background:'#1baf7a' }} disabled={saving}
                onClick={() => handleDecision('Approved')}>✓ Approve</button>
            ),
            ['Pending','In Review'].includes(selected.status) && (
              <button key="reject" className="btn-primary" style={{ background:'#e34948' }} disabled={saving}
                onClick={() => handleDecision('Rejected')}>✗ Reject</button>
            ),
            <button key="c" className="btn-secondary" onClick={() => { setSelected(null); setRemark(''); }}>Close</button>,
          ].filter(Boolean)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            {[['Type', selected.type], ['Reference', selected.reference || '-'],
              ['Requested By', selected.requestedBy || '-'], ['Priority', selected.priority],
              ['Current Level', selected.currentLevel || '-']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:'0.78rem', color:'#999' }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#f8f9fa', padding:'0.75rem', borderRadius:'6px', marginBottom:'1rem' }}>
            <strong>Description:</strong> {selected.description || '-'}
          </div>
          {['Pending','In Review'].includes(selected.status) && (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontWeight:600, marginBottom:'4px', fontSize:'0.88rem' }}>Approval Remarks</div>
              <textarea placeholder="Add your remarks or reason for rejection..."
                value={remark} onChange={e => setRemark(e.target.value)} rows={3}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', resize:'vertical', boxSizing:'border-box' }} />
            </div>
          )}
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <span style={{ fontSize:'0.85rem', color:'#666' }}>Current Status:</span>
            <StatusBadge text={selected.status} />
          </div>
        </Modal>
      )}
    </>
  );
}
