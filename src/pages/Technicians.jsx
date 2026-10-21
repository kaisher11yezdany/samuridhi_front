import { useEffect, useState, useRef } from 'react';
import Widget from '../components/Widget';
import Modal from '../components/Modal';
import { getTechnicians, createTechnician, updateTechnician,
         getTechDocs, uploadTechDoc, updateTechDoc, deleteTechDoc } from '../api/api';

const FALLBACK = [
  { _id:'1', techId:'TECH-001', name:'John Sharma',  mobile:'98765-43210', location:'Mumbai',    skills:'Installation, Repair',       jobsCompleted:42, rating:'4.8/5', status:'Available',     verified:false },
  { _id:'2', techId:'TECH-002', name:'Priya Kumar',  mobile:'99876-54321', location:'Bangalore', skills:'Testing, Commissioning',      jobsCompleted:38, rating:'4.7/5', status:'Available',     verified:true  },
  { _id:'3', techId:'TECH-003', name:'Raj Patel',    mobile:'97654-32109', location:'Pune',      skills:'Maintenance, Repair',         jobsCompleted:32, rating:'4.6/5', status:'Available',     verified:false },
  { _id:'4', techId:'TECH-004', name:'Anita Singh',  mobile:'96543-21098', location:'Delhi',     skills:'All Skills',                  jobsCompleted:29, rating:'4.9/5', status:'On Assignment', verified:true  },
  { _id:'5', techId:'TECH-005', name:'Vikram Reddy', mobile:'95432-10987', location:'Hyderabad', skills:'Installation, Testing',       jobsCompleted:36, rating:'4.5/5', status:'On Assignment', verified:false },
  { _id:'6', techId:'TECH-006', name:'Neha Gupta',   mobile:'94321-09876', location:'Chennai',   skills:'Maintenance, Service',        jobsCompleted:27, rating:'4.4/5', status:'Available',     verified:false },
];

const DOC_TYPES = ['ID Proof','Aadhar Card','PAN Card','Driving License','Passport','Police Verification','Training Certificate','Skill Certificate','Other'];
const EMPTY     = { name:'', mobile:'', location:'', skills:'' };

const statusColor = s => s === 'Available' ? '#22c55e' : s === 'On Assignment' ? '#f59e0b' : '#6b7280';
const docStatusStyle = s => ({
  Pending:  { bg:'#fef3c7', color:'#92400e' },
  Verified: { bg:'#d1fae5', color:'#065f46' },
  Rejected: { bg:'#fee2e2', color:'#991b1b' },
}[s] || { bg:'#f3f4f6', color:'#374151' });

// ── Documents Modal ──────────────────────────────────────────────────────────
function DocsModal({ tech, onClose }) {
  const [docs,       setDocs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [docType,    setDocType]    = useState(DOC_TYPES[0]);
  const [docName,    setDocName]    = useState('');
  const [remarks,    setRemarks]    = useState({});
  const fileRef = useRef();

  useEffect(() => {
    getTechDocs(tech._id)
      .then(r => setDocs(r.data))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [tech._id]);

  const handleUpload = async () => {
    if (!fileRef.current?.files[0]) return alert('Please select a file.');
    setUploading(true);
    const form = new FormData();
    form.append('file', fileRef.current.files[0]);
    form.append('docType', docType);
    form.append('name', docName || fileRef.current.files[0].name);
    try {
      const r = await uploadTechDoc(tech._id, form);
      setDocs(d => [...d, r.data]);
      setDocName(''); fileRef.current.value = '';
    } catch { alert('Upload failed. Try again.'); }
    setUploading(false);
  };

  const handleStatus = async (doc, status) => {
    try {
      const r = await updateTechDoc(tech._id, doc._id, { status, remarks: remarks[doc._id] || '' });
      setDocs(d => d.map(x => x._id === doc._id ? { ...x, ...r.data } : x));
    } catch {
      setDocs(d => d.map(x => x._id === doc._id ? { ...x, status, remarks: remarks[doc._id] || '' } : x));
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try { await deleteTechDoc(tech._id, doc._id); } catch {}
    setDocs(d => d.filter(x => x._id !== doc._id));
  };

  const allVerified = docs.length > 0 && docs.every(d => d.status === 'Verified');

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
         onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:14, padding:'28px 32px', width:'min(680px,95vw)', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.18)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:'#1e3a5f' }}>Verification Documents</h3>
            <p style={{ margin:'2px 0 0', fontSize:13, color:'#888' }}>{tech.name} · {tech.techId}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {allVerified && (
              <span style={{ background:'#d1fae5', color:'#065f46', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                ✓ Verified
              </span>
            )}
            <button onClick={onClose} style={{ border:'none', background:'none', fontSize:22, cursor:'pointer', color:'#888', lineHeight:1 }}>×</button>
          </div>
        </div>

        {/* Upload section */}
        <div style={{ background:'#f8faff', border:'1px dashed #c7d2fe', borderRadius:10, padding:16, marginBottom:18 }}>
          <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:'#1e3a5f' }}>Upload New Document</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              style={{ flex:'1 1 160px', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13 }}>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={docName} onChange={e => setDocName(e.target.value)}
              placeholder="Label (optional)"
              style={{ flex:'1 1 140px', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13 }} />
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ flex:'1 1 160px', fontSize:12, padding:'7px 6px', border:'1px solid #e2e8f0', borderRadius:8 }} />
            <button onClick={handleUpload} disabled={uploading}
              style={{ padding:'8px 18px', background:'#FF6B00', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
              {uploading ? 'Uploading…' : '⬆ Upload'}
            </button>
          </div>
          <p style={{ margin:'8px 0 0', fontSize:11, color:'#aaa' }}>Accepted: PDF, JPG, PNG, DOC · Max 20 MB</p>
        </div>

        {/* Document list */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {loading ? (
            <p style={{ textAlign:'center', color:'#888', padding:20 }}>Loading…</p>
          ) : docs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:36 }}>📄</div>
              <p style={{ color:'#888', fontSize:13, marginTop:8 }}>No documents uploaded yet.</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8faff' }}>
                  {['Document','Type','Size','Uploaded By','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'8px 10px', textAlign:'left', color:'#888', fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => {
                  const st = docStatusStyle(doc.status);
                  return (
                    <tr key={doc._id} style={{ borderBottom:'1px solid #f0f2f8' }}>
                      <td style={{ padding:'10px', fontWeight:600, color:'#1e3a5f', maxWidth:140 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:16 }}>{doc.filePath?.match(/\.(pdf)$/i) ? '📄' : doc.filePath?.match(/\.(jpg|jpeg|png)$/i) ? '🖼' : '📎'}</span>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100 }}>{doc.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px', color:'#555' }}>{doc.docType}</td>
                      <td style={{ padding:'10px', color:'#888' }}>{doc.fileSize || '—'}</td>
                      <td style={{ padding:'10px', color:'#888' }}>{doc.uploadedBy || '—'}</td>
                      <td style={{ padding:'10px' }}>
                        <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontWeight:700, fontSize:11 }}>{doc.status}</span>
                      </td>
                      <td style={{ padding:'10px' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={() => handleStatus(doc, 'Verified')} disabled={doc.status==='Verified'}
                              style={{ padding:'3px 8px', fontSize:11, fontWeight:700, background: doc.status==='Verified' ? '#e5e7eb' : '#d1fae5', color: doc.status==='Verified' ? '#9ca3af' : '#065f46', border:'none', borderRadius:6, cursor: doc.status==='Verified' ? 'default' : 'pointer' }}>
                              ✓ Verify
                            </button>
                            <button onClick={() => handleStatus(doc, 'Rejected')} disabled={doc.status==='Rejected'}
                              style={{ padding:'3px 8px', fontSize:11, fontWeight:700, background: doc.status==='Rejected' ? '#e5e7eb' : '#fee2e2', color: doc.status==='Rejected' ? '#9ca3af' : '#991b1b', border:'none', borderRadius:6, cursor: doc.status==='Rejected' ? 'default' : 'pointer' }}>
                              ✗ Reject
                            </button>
                            <button onClick={() => handleDelete(doc)}
                              style={{ padding:'3px 6px', fontSize:11, fontWeight:700, background:'#f3f4f6', color:'#6b7280', border:'none', borderRadius:6, cursor:'pointer' }}>
                              🗑
                            </button>
                          </div>
                          <input value={remarks[doc._id] || doc.remarks || ''} placeholder="Remarks…"
                            onChange={e => setRemarks(r => ({ ...r, [doc._id]: e.target.value }))}
                            style={{ fontSize:11, padding:'3px 6px', border:'1px solid #e2e8f0', borderRadius:6, width:'100%' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <button onClick={onClose} style={{ marginTop:18, padding:'10px 0', background:'#f0f2f8', color:'#1e3a5f', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Technicians() {
  const [list,      setList]      = useState(FALLBACK);
  const [addOpen,   setAddOpen]   = useState(false);
  const [viewTech,  setViewTech]  = useState(null);
  const [editTech,  setEditTech]  = useState(null);
  const [docsTech,  setDocsTech]  = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [editForm,  setEditForm]  = useState(EMPTY);

  useEffect(() => {
    getTechnicians().then(r => setList(r.data)).catch(() => {});
  }, []);

  const available = list.filter(t => t.status !== 'On Assignment').length;
  const assigned  = list.filter(t => t.status === 'On Assignment').length;
  const verified  = list.filter(t => t.verified).length;

  const handleAdd = async () => {
    try {
      const r = await createTechnician(form);
      setList(l => [r.data, ...l]);
    } catch {
      setList(l => [{ ...form, _id: Date.now().toString(), techId: `TECH-${String(l.length+1).padStart(3,'0')}`, jobsCompleted: 0, rating: 'N/A', status: 'Available', verified: false }, ...l]);
    }
    setAddOpen(false); setForm(EMPTY);
  };

  const openEdit = (t) => {
    setEditTech(t);
    setEditForm({ name: t.name, mobile: t.mobile, location: t.location, skills: t.skills, status: t.status });
  };

  const handleEdit = async () => {
    try {
      const r = await updateTechnician(editTech._id, editForm);
      setList(l => l.map(t => t._id === editTech._id ? r.data : t));
    } catch {
      setList(l => l.map(t => t._id === editTech._id ? { ...t, ...editForm } : t));
    }
    setEditTech(null);
  };

  return (
    <>
      {docsTech && <DocsModal tech={docsTech} onClose={() => setDocsTech(null)} />}

      <div className="page-header">
        <div className="section-title" style={{ marginBottom:0 }}>Technician Management</div>
        <button className="btn-add" onClick={() => setAddOpen(true)}>+ Add Technician</button>
      </div>

      <div className="widgets-grid">
        <Widget title="Total Technicians" value={list.length} subtitle="Active team" />
        <Widget title="Available"         value={available}   subtitle="Ready for work" type="success" />
        <Widget title="On Assignment"     value={assigned}    subtitle="Currently working" type="warning" />
        <Widget title="Verified"          value={verified}    subtitle="Documents approved" type="success" />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Mobile</th><th>Location</th>
              <th>Skills</th><th>Jobs</th><th>Rating</th><th>Status</th><th>Verified</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t._id}>
                <td>{t.techId}</td>
                <td><strong>{t.name}</strong></td>
                <td>{t.mobile}</td>
                <td>{t.location}</td>
                <td>{t.skills}</td>
                <td>{t.jobsCompleted}</td>
                <td>⭐ {t.rating}</td>
                <td>
                  <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                    background: statusColor(t.status) + '20', color: statusColor(t.status) }}>
                    {t.status}
                  </span>
                </td>
                <td>
                  {t.verified
                    ? <span style={{ color:'#065f46', fontWeight:700, fontSize:13 }}>✓ Yes</span>
                    : <span style={{ color:'#9ca3af', fontSize:13 }}>— No</span>}
                </td>
                <td style={{ whiteSpace:'nowrap' }}>
                  <a className="action-link" style={{ cursor:'pointer' }} onClick={() => setViewTech(t)}>View</a>
                  {' | '}
                  <a className="action-link orange" style={{ cursor:'pointer' }} onClick={() => openEdit(t)}>Edit</a>
                  {' | '}
                  <a className="action-link" style={{ cursor:'pointer', color:'#6c63ff' }} onClick={() => setDocsTech(t)}>Docs</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <Modal title="Add Technician" onClose={() => setAddOpen(false)}
          actions={<>
            <button className="btn-cancel" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-save" onClick={handleAdd}>Add Technician</button>
          </>}>
          {[['name','Full Name *'],['mobile','Mobile *'],['location','Location *'],['skills','Skills']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl.replace(' *','')}`}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </Modal>
      )}

      {/* View Modal */}
      {viewTech && (
        <Modal title="Technician Details" onClose={() => setViewTech(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => { setViewTech(null); setDocsTech(viewTech); }}>View Docs</button>
            <button className="btn-save" onClick={() => { setViewTech(null); openEdit(viewTech); }}>Edit</button>
          </>}>
          {[
            ['Technician ID', viewTech.techId],
            ['Full Name',     viewTech.name],
            ['Mobile',        viewTech.mobile],
            ['Location',      viewTech.location],
            ['Skills',        viewTech.skills],
            ['Jobs Completed',viewTech.jobsCompleted],
            ['Rating',        viewTech.rating],
            ['Status',        viewTech.status],
            ['Verified',      viewTech.verified ? '✓ Yes' : '— No'],
          ].map(([label, value]) => (
            <div key={label} className="modal-field" style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f0f2f8', padding:'8px 0', marginBottom:0 }}>
              <span style={{ fontSize:13, color:'#888', fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:13, color:'#1e3a5f', fontWeight:600 }}>{value ?? '—'}</span>
            </div>
          ))}
        </Modal>
      )}

      {/* Edit Modal */}
      {editTech && (
        <Modal title="Edit Technician" onClose={() => setEditTech(null)}
          actions={<>
            <button className="btn-cancel" onClick={() => setEditTech(null)}>Cancel</button>
            <button className="btn-save" onClick={handleEdit}>Save Changes</button>
          </>}>
          {[['name','Full Name'],['mobile','Mobile'],['location','Location'],['skills','Skills']].map(([k,lbl]) => (
            <div key={k} className="modal-field">
              <label>{lbl}</label>
              <input placeholder={`Enter ${lbl}`}
                value={editForm[k]} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="modal-field">
            <label>Status</label>
            <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
              style={{ width:'100%', padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14 }}>
              <option>Available</option>
              <option>On Assignment</option>
              <option>On Leave</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
