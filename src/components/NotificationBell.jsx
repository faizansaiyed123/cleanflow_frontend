import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, BASE_URL } from '../api/client';
import { relativeTime } from '../utils/format';

const ENTITY_ROUTE = {
  Lead: '/app/leads', Quote: '/app/quotes', Contract: '/app/contracts', Job: '/app/jobs', Invoice: '/app/invoices',
  Feedback: '/app/feedback',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const ref = useRef(null);
  const eventSourceRef = useRef(null);

  const loadCount = useCallback(() => {
    api.get('/api/notifications/unread-count').then((r) => setUnread(r.count)).catch(() => {});
  }, []);

  // Real-time updates via Server-Sent Events, with a 30s poll as a
  // fallback safety net in case the stream drops and silently doesn't
  // reconnect (EventSource auto-reconnects, but belt-and-suspenders).
  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const { ticket } = await api.get('/api/notifications/stream-ticket');
        if (cancelled) return;
        const es = new EventSource(`${BASE_URL}/api/notifications/stream?token=${ticket}`);
        eventSourceRef.current = es;
        es.addEventListener('unread_count', (e) => setUnread(JSON.parse(e.data).count));
        es.addEventListener('notification', (e) => setUnread(JSON.parse(e.data).count));
        es.onerror = () => { /* EventSource retries automatically */ };
      } catch {
        // Stream ticket failed (e.g. token expired mid-fetch) -- the
        // 30s poll below still keeps the badge roughly accurate.
      }
    }
    connect();
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => {
      cancelled = true;
      eventSourceRef.current?.close();
      clearInterval(interval);
    };
  }, [loadCount]);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openPanel = async () => {
    setOpen((o) => !o);
    if (!open) {
      const list = await api.get('/api/notifications', { unread_only: false });
      setNotifications(list.slice(0, 15));
    }
  };

  const markAllRead = async () => {
    await api.post('/api/notifications/mark-all-read');
    setUnread(0);
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
  };

  const clickNotification = async (n) => {
    if (!n.is_read) {
      await api.post(`/api/notifications/${n.id}/read`);
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    const base = ENTITY_ROUTE[n.link_entity_type];
    if (base && n.link_entity_id) navigate(`${base}/${n.link_entity_id}`);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-sm" onClick={openPanel} style={{ position: 'relative', fontSize: 18 }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: 'white', borderRadius: 999,
            fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 3px',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      {open && (
        <div className="card" style={{ position: 'absolute', top: 40, right: 0, width: 340, padding: 0, zIndex: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 13.5 }}>Notifications</strong>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-muted" style={{ padding: 20, textAlign: 'center', fontSize: 13 }}>No notifications yet.</div>
            ) : notifications.map((n) => (
              <div key={n.id} onClick={() => clickNotification(n)}
                style={{ padding: '10px 14px', borderBottom: '1px solid #f0ede3', cursor: 'pointer',
                  background: n.is_read ? 'transparent' : 'var(--moss-light)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{n.body}</div>}
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{relativeTime(n.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
