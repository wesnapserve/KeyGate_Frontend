import { useEffect, useState } from 'react';

const statusIcons = {
  Operational: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"/><path d="M7 10.5 9 12.5 13 8"/></svg>,
  Degraded: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"/><path d="M10 6.5v4"/><path d="M10 13.5v.5"/></svg>,
  Down: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"/><path d="m7 7 6 6"/><path d="m13 7-6 6"/></svg>,
};

const statusColors = {
  Operational: '#2dca72',
  Degraded: '#ffb547',
  Down: '#ff5252',
};

const LegendDot = ({ color, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', background: `${color}15`, padding: '3px 10px', borderRadius: 6, border: `1px solid ${color}30` }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
    {label}
  </span>
);

export default function HealthPage({ ctx, publicMode = false }) {
  const { api, notify } = ctx;
  const [rows, setRows] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api('/api/health').then(setRows).catch(() => setRows([]));
  }, []);

  const dayKey = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const byDay = new Map(rows.map((r) => [dayKey(r.day), r]));
  const bars = Array.from({ length: 90 }).map((_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (89 - idx));
    const key = dayKey(d);
    return byDay.get(key) || { day: key, internal_ok: null, db_ok: null, redis_ok: null, details: { missing_record: true } };
  });
  const colorFor = (r) => (r.internal_ok === true ? '#2dca72' : (r.internal_ok === false ? ((r.db_ok || r.redis_ok) ? '#ffb547' : '#ff5252') : '#4b5563'));
  const knownDays = bars.filter((r) => r.internal_ok !== null);
  const upDays = knownDays.filter((r) => r.internal_ok).length;
  const pct = knownDays.length ? ((upDays / knownDays.length) * 100).toFixed(2) : 'N/A';
  const latestKnown = [...bars].reverse().find((r) => r.internal_ok !== null);
  const summary = !latestKnown ? 'No data yet' : (latestKnown.internal_ok ? 'Operational' : ((latestKnown.db_ok || latestKnown.redis_ok) ? 'Degraded' : 'Down'));
  const summaryBg = summary === 'Operational' ? '#2dca7220' : summary === 'Degraded' ? '#ffb54720' : summary === 'Down' ? '#ff525220' : '#4b556320';
  const summaryBorder = summary === 'Operational' ? '#2dca7240' : summary === 'Degraded' ? '#ffb54740' : summary === 'Down' ? '#ff525240' : '#4b556340';
  const summaryColor = summary === 'Operational' ? 'var(--green)' : summary === 'Degraded' ? 'var(--amber)' : summary === 'Down' ? 'var(--red)' : 'var(--muted)';

  const refreshNow = async () => {
    setRefreshing(true);
    try {
      await api('/api/health/refresh-now', { method: 'POST', body: {} });
      const data = await api('/api/health');
      setRows(data);
      notify('Health refreshed');
    } catch (e) {
      notify(e.message || 'Failed to refresh health', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return <div className='page active'>
    <div className='page-header'><div className='page-title'>System Health</div><div className='page-sub'>Public status page for internal server, database, and redis.</div></div>
    <div className='card' style={{ background: summaryBg, borderColor: summaryBorder }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: summaryColor, display: 'flex' }}>{statusIcons[summary] || null}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: summaryColor }}>Current status: {summary}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>90-day uptime: {pct}%</div>
          </div>
        </div>
        {!publicMode && <button className='btn btn-ghost btn-sm' disabled={refreshing} onClick={refreshNow}>{refreshing ? 'Refreshing...' : 'Refresh now'}</button>}
      </div>
    </div>
    <div className='card'>
      <div className='card-header'><div className='card-title'>90-day uptime history</div></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <LegendDot color='#2dca72' label='Operational' />
        <LegendDot color='#ffb547' label='Degraded' />
        <LegendDot color='#ff5252' label='Down' />
        <LegendDot color='#4b5563' label='No data' />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(90,1fr)', gap: 3 }}>
        {bars.map((r, i) => <div key={i} title={`${r.day}\nInternal: ${r.internal_ok === null ? 'N/A' : (r.internal_ok ? 'OK' : 'FAIL')}\nDB: ${r.db_ok === null ? 'N/A' : (r.db_ok ? 'OK' : 'FAIL')}\nRedis: ${r.redis_ok === null ? 'N/A' : (r.redis_ok ? 'OK' : 'FAIL')}\nDetails: ${JSON.stringify(r.details || {})}`} style={{ height: 28, borderRadius: 3, background: colorFor(r), cursor: 'pointer', transition: 'opacity .15s' }} onMouseEnter={(e) => e.target.style.opacity = '.7'} onMouseLeave={(e) => e.target.style.opacity = '1'} />)}
      </div>
    </div>
  </div>;
}