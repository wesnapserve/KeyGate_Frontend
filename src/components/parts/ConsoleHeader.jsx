const IconBell = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M10 2.5a6 6 0 0 0-6 6v3l-1.5 3.5h15L16 11.5v-3a6 6 0 0 0-6-6Z"/><path d="M8 16a2 2 0 0 0 4 0"/></svg>;

export default function ConsoleHeader({ page, selectedProject, projectSlug, onSwitchProject, onOpenMobileMenu, onOpenNotifications, mobileMenuOpen = false }) {
  const pageTitle = String(page || 'overview').replace(/^./, (m) => m.toUpperCase());

  return <header className='console-header app-shell-header'>
    <div className='app-shell-desktop'>
      <div className='logo app-shell-logo'>
        <div className='logo-mark'>
          <div className='logo-icon'>
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><rect x="2" y="2" width="7" height="8" rx="1.5" /><rect x="11" y="2" width="7" height="5" rx="1.5" /><rect x="2" y="12" width="7" height="6" rx="1.5" /><rect x="11" y="9" width="7" height="9" rx="1.5" /></svg>
          </div>
          <div>
            <div className='logo-name'>KeyGate</div>
            <div className='logo-sub'>API access manager</div>
          </div>
        </div>
      </div>
      <div className='app-shell-project'>
        <div className='console-title'>{selectedProject?.name || 'Project'} • {pageTitle}</div>
        <div className='console-sub'>{selectedProject?.slug || projectSlug} · API Access Manager</div>
      </div>
      <button className='btn btn-ghost btn-sm app-shell-switch' onClick={onSwitchProject}>Switch project</button>
    </div>

    <div className='mobile-appbar app-shell-mobile'>
      <button className={`mobile-icon-btn mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} onClick={onOpenMobileMenu} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
          {mobileMenuOpen
            ? <><path d="M5 5 15 15"/><path d="M15 5 5 15"/></>
            : <><path d="M3 5h14"/><path d="M3 10h14"/><path d="M3 15h14"/></>}
        </svg>
      </button>
      <div>
        <div className='mobile-brand'>KeyGate</div>
        <div className='mobile-shell-sub'>{pageTitle}</div>
      </div>
      <div className='mobile-appbar-actions'>
        <button className='mobile-icon-btn' onClick={onOpenNotifications} aria-label='Notifications'><IconBell /></button>
        <button className='mobile-avatar' onClick={onSwitchProject} aria-label='Back to console'>A</button>
      </div>
    </div>
  </header>;
}