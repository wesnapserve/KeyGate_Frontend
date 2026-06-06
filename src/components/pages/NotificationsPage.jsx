import { useEffect, useState } from 'react';
import '../styles/LogsPage.css';

const IconAlertTriangle = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}><path d="M10 2.5 1.5 17h17L10 2.5Z"/><path d="M10 7.5v4"/><path d="M10 14.5v.5"/></svg>;
const IconClock = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="10" cy="10" r="7.5"/><path d="M10 5.5V10l3 1.5"/></svg>;
const IconInbox = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}><path d="M2.5 10h4l1.5 2h4L13 10h4.5"/><path d="M16.5 3.5h-13A1.5 1.5 0 0 0 2 5v11a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 18 16V5a1.5 1.5 0 0 0-1.5-1.5Z"/></svg>;

const SectionHeader = ({ icon: Icon, title }) => (
  <div className='card-header' style={{ marginBottom: 4, padding: '0 0 8px', borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'flex', color: 'var(--accent2)' }}><Icon /></span>
      <div className='card-title'>{title}</div>
    </div>
  </div>
);

const NotificationRow = ({ children }) => (
  <div className='list-row' style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)',
  }}>
    {children}
  </div>
);

export default function NotificationsPage({ ctx }) {
  const { subkeys, fmtNum, fmtDate, api, notify } = ctx;
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState({});
  const refresh = async () => setRequests(await api('/api/quota-requests'));
  useEffect(() => { refresh(); }, []);

  const nearLimit = subkeys.filter((s) => (Number(s.tokens_used || 0) / Number(s.monthly_token_limit || 1)) >= 0.8);
  const expiring = subkeys.filter((s) => s.expires_at && (Number(s.expires_at) - Math.floor(Date.now()/1000)) < 7*86400);

  const grant = async (id, type, amount, note='') => {
    const k = `grant:${id}:${type}`;
    if (busy[k]) return;
    setBusy((b) => ({ ...b, [k]: true }));
    try {
    const created = await api('/api/quota-requests', { method:'POST', body:{ subkey_id:id, request_type:type, amount, note } });
    await api('/api/quota-requests/' + created.id, { method:'PATCH', body:{ status:'approved' } });
    notify('Grant approved');
    refresh();
    } finally {
      setBusy((b) => ({ ...b, [k]: false }));
    }
  };
  const decide = async (id, status) => {
    const k = `decide:${id}`;
    if (busy[k]) return;
    setBusy((b) => ({ ...b, [k]: true }));
    try {
      await api('/api/quota-requests/' + id, { method:'PATCH', body:{ status } }); notify('Request updated'); refresh();
    } finally {
      setBusy((b) => ({ ...b, [k]: false }));
    }
  };

  return <div className='page active'><div className='page-header'><div className='page-title'>Notifications</div><div className='page-sub'>Quota alerts, expiry alerts, and admin approvals.</div></div>
    <div className='card'>
      <SectionHeader icon={IconAlertTriangle} title='Near limit' />
      {nearLimit.length ? nearLimit.map(s => {
        const k = `grant:${s.id}:credits`;
        return <NotificationRow key={s.id}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{s.name}</div>
            <div className='mono' style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtNum(s.tokens_used)} / {fmtNum(s.monthly_token_limit)} tokens used</div>
          </div>
          <button className='btn btn-amber btn-sm' disabled={busy[k]} onClick={() => grant(s.id, 'credits', '20', 'Admin approved quota extension from notifications')}>
            {busy[k] ? 'Granting...' : `Grant +20k tokens`}
          </button>
        </NotificationRow>;
      }) : <div className='empty-text' style={{ padding: '16px 0', textAlign: 'center', color: 'var(--dim)' }}>All subkeys within healthy limits.</div>}
    </div>

    <div className='card'>
      <SectionHeader icon={IconClock} title='Expiring soon' />
      {expiring.length ? expiring.map(s => {
        const k = `grant:${s.id}:expiry_extend`;
        return <NotificationRow key={s.id}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{s.name}</div>
            <div className='mono' style={{ fontSize: 11, color: 'var(--muted)' }}>Expires {fmtDate(s.expires_at)}</div>
          </div>
          <button className='btn btn-amber btn-sm' disabled={busy[k]} onClick={() => grant(s.id, 'expiry_extend', '7', 'Admin approved expiry extension from notifications')}>
            {busy[k] ? 'Extending...' : `Extend +7 days`}
          </button>
        </NotificationRow>;
      }) : <div className='empty-text' style={{ padding: '16px 0', textAlign: 'center', color: 'var(--dim)' }}>No subkeys expiring this week.</div>}
    </div>

    <div className='card'>
      <SectionHeader icon={IconInbox} title='Quota extension requests' />
      {requests.length ? requests.map(r => {
        const k = `decide:${r.id}`;
        return <NotificationRow key={r.id}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{r.subkey_name}</div>
            <div className='mono' style={{ fontSize: 11, color: 'var(--muted)' }}>{r.request_type}{r.amount ? ` (${r.amount})` : ''} — <span className={`badge ${r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'revoked' : 'paused'}`} style={{ fontSize: 10 }}>{r.status}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className='btn btn-sm btn-green' disabled={busy[k]} onClick={() => decide(r.id, 'approved')}>{busy[k] ? 'Updating...' : 'Approve'}</button>
            <button className='btn btn-sm btn-danger' disabled={busy[k]} onClick={() => decide(r.id, 'rejected')}>Reject</button>
          </div>
        </NotificationRow>;
      }) : <div className='empty-text' style={{ padding: '16px 0', textAlign: 'center', color: 'var(--dim)' }}>No pending quota requests.</div>}
    </div>
  </div>;
}