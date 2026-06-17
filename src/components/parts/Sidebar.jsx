import { IconOverview, IconMasterKey, IconSubkey, IconLogs, IconDemo, IconHealth, IconNotifications, IconArrowLeft, IconAnalytics, IconTeam, IconBilling, IconSettings, IconUser } from './Icons';

const sections = [
  { label: 'Overview', items: [['overview', 'Overview', IconOverview]] },
  { label: 'Access', items: [['masterkeys', 'Master keys', IconMasterKey], ['subkeys', 'Subkeys', IconSubkey], ['demo', 'Live demo', IconDemo]] },
  { label: 'Monitoring', items: [['analytics', 'Analytics', IconAnalytics], ['logs', 'Request logs', IconLogs], ['notifications', 'Notifications', IconNotifications], ['health', 'Health', IconHealth]] },
  { label: 'Team', items: [['members', 'Members', IconTeam], ['roles', 'Roles', IconUser], ['invites', 'Invites', IconNotifications]] },
  { label: 'Billing', items: [['usage', 'Usage', IconBilling], ['subscription', 'Subscription', IconBilling], ['invoices', 'Invoices', IconLogs]] },
  { label: 'Settings', items: [['general', 'General', IconSettings], ['endpoint', 'API Endpoint', IconDemo], ['security', 'Security', IconMasterKey], ['audit', 'Audit Logs', IconLogs], ['danger', 'Danger Zone', IconHealth]] },
];

const mobileItems = [
  ['overview', 'Overview', IconOverview],
  ['masterkeys', 'Access', IconMasterKey],
  ['analytics', 'Monitor', IconAnalytics],
  ['members', 'Team', IconTeam],
  ['usage', 'Billing', IconBilling],
];

export default function Sidebar({ page, navigate, onBackToConsole, drawerOpen, setDrawerOpen }) {
  const go = (next) => { navigate(next); setDrawerOpen(false); };
  const renderItem = ([k, l, Icon], mobile = false) => (
    <button key={k} className={`${mobile ? 'mobile-drawer-item' : 'nav-item'} ${page === k ? 'active' : ''}`} onClick={() => mobile ? go(k) : navigate(k)}>
      <Icon /> {l}{k === 'demo' && <span className='nav-dot' />}
    </button>
  );

  return <>
    <aside className='sidebar'>
      <nav className='nav'>
        {onBackToConsole && <button className='nav-item nav-back' onClick={onBackToConsole}><IconArrowLeft /> Back to console</button>}
        {sections.map((section) => <div className='nav-section' key={section.label}><div className='nav-label'>{section.label}</div>{section.items.map((item) => renderItem(item))}</div>)}
      </nav>
      <div className='sidebar-footer'><div className='api-url-box'><div className='api-url-label'>Proxy endpoint</div><div className='api-url'>https://keygate-backend.onrender.com/</div></div></div>
    </aside>

    <div className={`mobile-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
      <aside className='mobile-drawer'>
        <div className='mobile-drawer-title'>KeyGate</div>
        <div className='mobile-drawer-list'>{sections.map((section) => <div key={section.label}><div className='nav-label'>{section.label}</div>{section.items.map((item) => renderItem(item, true))}</div>)}</div>
        <div className='mobile-drawer-footer'>https://keygate-backend.onrender.com/</div>
      </aside>
    </div>

    <nav className='mobile-tabbar' aria-label='Mobile navigation'>
      {mobileItems.map(([k, l, Icon]) => <button key={k} className={`mobile-tab ${page === k ? 'active' : ''}`} onClick={() => go(k)}><Icon width={18} height={18} /><span>{l}</span></button>)}
    </nav>
  </>;
}
