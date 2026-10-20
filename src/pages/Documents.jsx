import { useState, useEffect, useRef } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getDocuments, createDocument, deleteDocument } from '../api/api';

const CATEGORIES = ['All','Completion Certificate','Engineering Drawing','O&M Manual','Warranty','AMC Agreement','Inspection Report','Template','Other'];

const ICONS = {
  'Completion Certificate':'📜','Engineering Drawing':'📐','O&M Manual':'📖',
  'Warranty':'🛡️','AMC Agreement':'📝','Inspection Report':'🔍','Template':'📋',
};

const FILE_URL = (filename) => `http://localhost:5000/uploads/${filename}`;

const EMPTY = { name:'', category:'Other', project:'', customer:'' };

export default function Documents() {
  const [docs, setDocs]             = useState([]);
  const [selected, setSelected]     = useState(null);
  const [activeCategory, setActive] = useState('All');
  const [search, setSearch]         = useState('');
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState(EMPTY);
  const [file, setFile]             = useState(null);
  const [saving, setSaving]         = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const fileRef                     = useRef(null);

  const load = () => getDocuments().then(r => setDocs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = docs.filter(d =>
    (activeCategory === 'All' || d.category === activeCategory) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.project || '').toLowerCase().includes(search.toLowerCase()))
  );

  const active  = docs.filter(d => d.status === 'Active').length;
  const expired = docs.filter(d => d.status === 'Expired').length;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!form.name) setForm(prev => ({ ...prev, name: f.name.replace(/\.[^.]+$/, '') }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    if (!form.name) setForm(prev => ({ ...prev, name: f.name.replace(/\.[^.]+$/, '') }));
  };

  const handleAdd = async () => {
    if (!form.name) return alert('Document name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await createDocument(fd);
      await load();
      setShowAdd(false);
      setForm(EMPTY);
      setFile(null);
    } catch (e) { alert(e.response?.data?.message || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    try { await deleteDocument(doc._id); await load(); setSelected(null); }
    catch { alert('Delete failed'); }
  };

  const openModal = () => { setForm(EMPTY); setFile(null); setShowAdd(true); };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Total Documents" value={docs.length}           subtitle="All uploaded files" />
        <Widget title="Active"          value={active}                subtitle="Valid documents"    type="success" />
        <Widget title="Expired"         value={expired}               subtitle="Needs renewal"      type="danger" />
        <Widget title="Categories"      value={CATEGORIES.length - 2} subtitle="Document types" />
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center' }}>
        <input type="text" placeholder="Search documents…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'0.5rem 0.75rem', border:'1px solid #ddd', borderRadius:'6px', flex:1, minWidth:'200px' }} />
        <button className="btn-primary" style={{ whiteSpace:'nowrap' }} onClick={openModal}>+ Upload Document</button>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActive(cat)}
            style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'0.85rem',
              background: activeCategory === cat ? '#1e3a5f' : 'white',
              color: activeCategory === cat ? 'white' : '#555',
              borderColor: activeCategory === cat ? '#1e3a5f' : '#ddd' }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1rem' }}>
        {filtered.length > 0
          ? filtered.map(doc => (
            <div key={doc._id}
              style={{ background:'white', border:'1px solid #e8e8e8', borderRadius:'8px', padding:'1rem', cursor:'pointer', transition:'box-shadow 0.2s' }}
              onClick={() => setSelected(doc)}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                <div style={{ fontSize:'2rem', lineHeight:1 }}>{ICONS[doc.category] || '📄'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:'0.88rem', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'#777', marginBottom:'4px' }}>{doc.category}{doc.fileSize ? ` · ${doc.fileSize}` : ''}</div>
                  <div style={{ fontSize:'0.78rem', color:'#999' }}>{doc.project || '-'}</div>
                  <div style={{ fontSize:'0.78rem', color:'#999' }}>{doc.uploadedBy || '-'}</div>
                </div>
              </div>
              <div style={{ marginTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }}>
                <StatusBadge text={doc.status} />
                <div style={{ display:'flex', gap:'6px' }}>
                  {doc.filePath && (
                    <a href={FILE_URL(doc.filePath)} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ padding:'4px 10px', fontSize:'0.78rem', border:'1px solid #1e3a5f', borderRadius:'4px', color:'#1e3a5f', textDecoration:'none', background:'white' }}>
                      ⬇ Download
                    </a>
                  )}
                  <button className="btn-action" onClick={e => { e.stopPropagation(); setSelected(doc); }}>View</button>
                </div>
              </div>
            </div>
          ))
          : <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'3rem', color:'#999' }}>No documents found.</div>
        }
      </div>

      {/* View Modal */}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}
          actions={[
            selected.filePath && (
              <a key="dl" href={FILE_URL(selected.filePath)} target="_blank" rel="noreferrer" download
                style={{ padding:'0.5rem 1.25rem', background:'#1e3a5f', color:'white', borderRadius:'6px', textDecoration:'none', fontSize:'0.88rem' }}>
                ⬇ Download
              </a>
            ),
            <button key="del" className="btn-danger" onClick={() => handleDelete(selected)} style={{ marginRight:'auto' }}>Delete</button>,
            <button key="c" className="btn-secondary" onClick={() => setSelected(null)}>Close</button>,
          ].filter(Boolean)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {[['Document ID', selected.docId || '-'], ['Category', selected.category],
              ['Project', selected.project || '-'], ['Customer', selected.customer || '-'],
              ['File Size', selected.fileSize || 'No file attached'], ['Uploaded By', selected.uploadedBy || '-'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:'0.78rem', color:'#999' }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
            <span>Status:</span><StatusBadge text={selected.status} />
          </div>
          <div style={{ marginTop:'1.5rem', background:'#f8f9fa', border:'1px dashed #ccc', borderRadius:'8px', height:'120px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px', color:'#999' }}>
            <span style={{ fontSize:'2rem' }}>{ICONS[selected.category] || '📄'}</span>
            {selected.filePath
              ? <span style={{ fontSize:'0.85rem' }}>File attached — use Download to open</span>
              : <span style={{ fontSize:'0.85rem' }}>No file attached</span>
            }
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showAdd && (
        <Modal title="Upload Document" onClose={() => { setShowAdd(false); setFile(null); }}
          actions={[
            <button key="s" className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Uploading…' : 'Upload'}</button>,
            <button key="c" className="btn-secondary" onClick={() => { setShowAdd(false); setFile(null); }}>Cancel</button>,
          ]}>
          <div style={{ display:'grid', gap:'1rem' }}>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{ border:`2px dashed ${dragOver ? '#1e3a5f' : '#ccc'}`, borderRadius:'8px', padding:'1.5rem', textAlign:'center', cursor:'pointer', background: dragOver ? '#f0f4ff' : '#fafafa', transition:'all 0.2s' }}>
              <div style={{ fontSize:'2rem', marginBottom:'8px' }}>📁</div>
              {file
                ? <div style={{ fontWeight:600, color:'#1e3a5f' }}>{file.name}<br /><span style={{ fontWeight:400, color:'#888', fontSize:'0.82rem' }}>{(file.size/1024).toFixed(1)} KB</span></div>
                : <div style={{ color:'#888', fontSize:'0.88rem' }}>Drag & drop a file here, or <span style={{ color:'#1e3a5f', textDecoration:'underline' }}>browse</span></div>
              }
              <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleFileChange} />
            </div>

            {[['Document Name *','name','text'],['Project','project','text'],['Customer','customer','text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box' }} />
              </div>
            ))}

            <div>
              <label style={{ display:'block', fontSize:'0.85rem', marginBottom:'4px', fontWeight:500 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:'6px' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
