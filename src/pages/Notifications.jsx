import { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import StatusBadge from '../components/StatusBadge';
import { getNotifications, markNotificationRead, markAllRead } from '../api/api';
import { useAuth } from '../context/AuthContext';

const NOTIF_COLORS = {
  Critical: { border:'#e34948', bg:'#fef2f2' },
  Warning:  { border:'#eda100', bg:'#fffbeb' },
  Info:     { border:'#3b82f6', bg:'#eff6ff' },
};

const FILTERS = ['All','Unread','Critical','Warning','Info'];

const timeAgo = ts => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [filter, setFilter] = useState('All');
  const { refreshUnread } = useAuth();

  const load = () => getNotifications().then(r => setNotifs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const unread   = notifs.filter(n => !n.read).length;
  const critical = notifs.filter(n => n.type === 'Critical').length;
  const warnings = notifs.filter(n => n.type === 'Warning').length;

  const filtered = notifs.filter(n =>
    filter === 'All' ? true :
    filter === 'Unread' ? !n.read :
    n.type === filter
  );

  const handleMarkRead = async (notif) => {
    if (notif.read) return;
    try {
      await markNotificationRead(notif._id);
      setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      refreshUnread();
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      await load();
      refreshUnread();
    } catch { /* silent */ }
  };

  return (
    <>
      <div className="widgets-grid">
        <Widget title="Unread"   value={unread}        subtitle="Notifications"      type={unread > 0 ? 'warning' : 'success'} />
        <Widget title="Critical" value={critical}       subtitle="Require attention"  type="danger" />
        <Widget title="Warnings" value={warnings}       subtitle="Action recommended" type="warning" />
        <Widget title="Total"    value={notifs.length}  subtitle="All notifications" />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'6px 14px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'0.85rem',
                background: filter === f ? '#1e3a5f' : 'white',
                color: filter === f ? 'white' : '#555',
                borderColor: filter === f ? '#1e3a5f' : '#ddd' }}>
              {f}{f === 'Unread' && unread > 0 ? ` (${unread})` : ''}
            </button>
          ))}
        </div>
        {unread > 0 && <button className="btn-secondary" onClick={handleMarkAll}>Mark all as read</button>}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {filtered.length > 0
          ? filtered.map(n => {
            const colors = NOTIF_COLORS[n.type] || {};
            return (
              <div key={n._id} onClick={() => handleMarkRead(n)}
                style={{
                  background: n.read ? 'white' : colors.bg,
                  border: `1px solid ${n.read ? '#e8e8e8' : colors.border}`,
                  borderLeft: `4px solid ${colors.border || '#ccc'}`,
                  borderRadius:'8px', padding:'1rem 1.25rem', cursor:'pointer', transition:'box-shadow 0.2s',
                  display:'flex', gap:'1rem', alignItems:'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                <div style={{ fontSize:'1.5rem', lineHeight:1, marginTop:'2px' }}>{n.icon || 'ℹ️'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', flexWrap:'wrap' }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize:'0.95rem' }}>{n.title}</div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <StatusBadge text={n.type} />
                      {!n.read && <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#1e3a5f', display:'inline-block', flexShrink:0 }}></span>}
                    </div>
                  </div>
                  <div style={{ color:'#555', fontSize:'0.88rem', margin:'4px 0' }}>{n.message}</div>
                  <div style={{ display:'flex', gap:'16px', fontSize:'0.78rem', color:'#999', marginTop:'4px' }}>
                    {n.module && <span>📱 {n.module}</span>}
                    <span>🕒 {timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
          : <div style={{ textAlign:'center', padding:'3rem', color:'#999', background:'white', borderRadius:'8px', border:'1px solid #e8e8e8' }}>
              No notifications in this category.
            </div>
        }
      </div>
    </>
  );
}
