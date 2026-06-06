const IconOverview = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="7" height="8" rx="1.5"/><rect x="11" y="2" width="7" height="5" rx="1.5"/><rect x="2" y="12" width="7" height="6" rx="1.5"/><rect x="11" y="9" width="7" height="9" rx="1.5"/></svg>;
const IconMasterKeys = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M12.5 5.5 3 15v2.5h2.5L13 10"/><path d="m11 7 1.5 1.5"/><path d="M6 12 7.5 13.5"/><path d="M8.5 9.5 10 11"/></svg>;
const IconSubkeys = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 6.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"/><path d="M11.5 9.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"/><path d="M7.5 9v4"/><path d="M5.5 13h4"/><path d="M14 12v4.5"/><path d="M11.5 14.5h5"/></svg>;
const IconLogs = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2.5h12A1.5 1.5 0 0 1 17.5 4v13A1.5 1.5 0 0 1 16 18.5H4A1.5 1.5 0 0 1 2.5 17V4A1.5 1.5 0 0 1 4 2.5Z"/><path d="M6 7h8"/><path d="M6 10.5h6"/><path d="M6 14h4"/></svg>;
const IconDemo = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 4.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3l2 2.5 2-2.5h3a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-10Z"/><path d="M8 7.5 11 10l-3 2.5"/></svg>;
const IconHealth = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17.5c-3.5-2.5-7-5.5-7-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 3.5-3.5 6.5-7 9Z"/><path d="M7.5 9.5h2v-2h1v2h2v1h-2v2h-1v-2h-2v-1Z"/></svg>;
const IconNotifications = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5a6 6 0 0 0-6 6v3l-1.5 3.5h15L16 11.5v-3a6 6 0 0 0-6-6Z"/><path d="M8 16a2 2 0 0 0 4 0"/></svg>;

const items = [
  ['overview', 'Overview', IconOverview],
  ['masterkeys', 'Master keys', IconMasterKeys],
  ['subkeys', 'Subkeys', IconSubkeys],
  ['logs', 'Request logs', IconLogs],
  ['demo', 'Live demo', IconDemo],
  ['health', 'Health', IconHealth],
  ['notifications', 'Notifications', IconNotifications],
];

export default function Sidebar({ page, navigate, onBackToConsole, drawerOpen, setDrawerOpen }) {

  const go = (next) => {
    navigate(next);
    setDrawerOpen(false);
  };

  return <>
    <aside className='sidebar'>
      <nav className='nav'>
        <div className='nav-label'>Platform</div>
        {onBackToConsole && <button className='nav-item' onClick={onBackToConsole}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4 2.5 10 8 16"/><path d="M2.5 10h15"/></svg> Back to console</button>}
        {items.map(([k, l, Icon]) => <button key={k} className={`nav-item ${page === k ? 'active' : ''}`} onClick={() => navigate(k)}><Icon />{l}{k === 'demo' && <span className='nav-dot' />}</button>)}
      </nav>
      <div className='sidebar-footer'><div className='api-url-box'><div className='api-url-label'>Proxy endpoint</div><div className='api-url'>https://keygate-backend.onrender.com/</div></div></div>
    </aside>

    <div className={`mobile-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
      <aside className='mobile-drawer'>
        <div className='mobile-drawer-title'>KeyGate</div>
        <div className='mobile-drawer-list'>
          {items.map(([k, l, Icon]) => <button key={k} className={`mobile-drawer-item ${page === k ? 'active' : ''}`} onClick={() => go(k)}><Icon />{l}</button>)}
        </div>
        <div className='mobile-drawer-footer'>https://keygate-backend.onrender.com/</div>
      </aside>
    </div>

    <nav className='mobile-tabbar' aria-label='Mobile navigation'>
      {items.slice(0, 5).map(([k, l, Icon]) => <button key={k} className={`mobile-tab ${page === k ? 'active' : ''}`} onClick={() => go(k)}><Icon /><span>{l.split(' ')[0]}</span></button>)}
    </nav>
  </>;
}