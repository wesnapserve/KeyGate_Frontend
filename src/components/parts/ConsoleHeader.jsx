import { LogoFull } from './Logo';
import { IconBell, IconMenu, IconExternal, IconUser, IconSettings, IconBilling, IconLogs } from './Icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ConsoleHeader({ page, selectedProject, projectSlug, onSwitchProject, onOpenMobileMenu, onOpenNotifications, mobileMenuOpen = false, navigate }) {
  const { user, logout } = useAuth();
  const pageTitle = String(page || 'overview').replace(/^./, (m) => m.toUpperCase());
  const go = (target) => navigate?.(target);
  const userLabel = user?.email || user?.name || 'Signed in';
  const avatar = (user?.email || user?.name || selectedProject?.name || 'K').charAt(0).toUpperCase();

  return <header className='console-header app-shell-header'>
    <div className='app-shell-desktop'>
      <div className='logo app-shell-logo'>
        <LogoFull size={22} />
      </div>
      <div className='app-shell-project'>
        <div className='console-title'>{selectedProject?.name || 'Project'} <span style={{color:'var(--muted)',fontWeight:400}}>&bull;</span> {pageTitle}</div>
        <div className='console-sub'>{selectedProject?.slug || projectSlug} &middot; API Access Manager</div>
      </div>
      <div className='app-shell-actions'>
        <button className='btn btn-ghost btn-sm app-shell-switch' onClick={onSwitchProject}><IconExternal width={14} height={14} /> Switch project</button>
        <div className='user-menu'>
          <button className='auth-user-chip user-menu-trigger' type='button'>
            <span>{user?.picture ? <img src={user.picture} alt='' /> : avatar}</span>
            <strong>{userLabel}</strong>
          </button>
          <div className='user-menu-panel'>
            <button onClick={() => go('profile')}><IconUser /> Profile</button>
            <button onClick={() => go('workspace')}><IconSettings /> Workspace Settings</button>
            <button onClick={() => go('subscription')}><IconBilling /> Billing</button>
            <button onClick={() => go('docs')}><IconLogs /> Documentation</button>
            <button className='danger' onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>

    <div className='mobile-appbar app-shell-mobile'>
      <button className={`mobile-icon-btn mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} onClick={onOpenMobileMenu} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
        <IconMenu width={20} height={20} />
      </button>
      <div>
        <div className='mobile-brand'>KeyGate</div>
        <div className='mobile-shell-sub'>{pageTitle}</div>
      </div>
      <div className='mobile-appbar-actions'>
        <button className='mobile-icon-btn' onClick={onOpenNotifications} aria-label='Notifications'><IconBell width={20} height={20} /></button>
        <button className='mobile-avatar' onClick={() => go('profile')} aria-label='Profile'>{avatar}</button>
        <button className='mobile-logout' onClick={logout} aria-label='Logout'>Logout</button>
      </div>
    </div>
  </header>;
}
