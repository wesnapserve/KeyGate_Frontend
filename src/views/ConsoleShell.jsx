import { useKeyGate } from '../contexts/KeyGateContext';
import Sidebar from '../components/parts/Sidebar';
import ConsoleHeader from '../components/parts/ConsoleHeader';
import OverviewPage from '../components/pages/OverviewPage';
import MasterKeysPage from '../components/pages/MasterKeysPage';
import SubkeysPage from '../components/pages/SubkeysPage';
import LogsPage from '../components/pages/LogsPage';
import DemoPage from '../components/pages/DemoPage';
import HealthPage from '../components/pages/HealthPage';
import NotificationsPage from '../components/pages/NotificationsPage';
import PlaceholderPage from '../components/pages/PlaceholderPage';

const PAGES = {
  overview: OverviewPage,
  masterkeys: MasterKeysPage,
  subkeys: SubkeysPage,
  logs: LogsPage,
  demo: DemoPage,
  health: HealthPage,
  notifications: NotificationsPage,
};

const PLACEHOLDER_PAGES = new Set(['analytics', 'members', 'roles', 'invites', 'usage', 'subscription', 'invoices', 'general', 'endpoint', 'security', 'audit', 'danger', 'profile', 'workspace', 'docs']);

export default function ConsoleShell({ go, page, projectSlug }) {
  const { ctx, selectedProject, mobileMenuOpen, setMobileMenuOpen, notif } = useKeyGate();

  const navigate = (p) => go(`/console/${projectSlug}/${p}`);
  const PageComponent = PAGES[page];

  return (
    <>
      <div className='app'>
        <ConsoleHeader
          page={page}
          selectedProject={selectedProject}
          projectSlug={projectSlug}
          onSwitchProject={() => go('/console')}
          onOpenMobileMenu={() => setMobileMenuOpen((open) => !open)}
          onOpenNotifications={() => navigate('notifications')}
          mobileMenuOpen={mobileMenuOpen}
          navigate={navigate}
        />
        <Sidebar
          page={page}
          navigate={navigate}
          onBackToConsole={() => go('/console')}
          drawerOpen={mobileMenuOpen}
          setDrawerOpen={setMobileMenuOpen}
        />
        <main className='main'>
          <div key={page} className='page-transition'>
            {PLACEHOLDER_PAGES.has(page) ? (
              <PlaceholderPage type={page} />
            ) : PageComponent && (
              page === 'overview'
                ? <OverviewPage navigate={navigate} ctx={ctx} />
                : <PageComponent ctx={ctx} />
            )}
          </div>
        </main>
      </div>
      <div className={`notif ${notif.show ? 'show' : ''} ${notif.type}`}>{notif.msg}</div>
    </>
  );
}