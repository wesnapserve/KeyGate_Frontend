import { useEffect, useMemo, useState } from 'react';
import useConsoleRouteState from './hooks/useConsoleRouteState';
import Sidebar from './components/parts/Sidebar';
import ConsoleHeader from './components/parts/ConsoleHeader';
import OverviewPage from './components/pages/OverviewPage';
import MasterKeysPage from './components/pages/MasterKeysPage';
import SubkeysPage from './components/pages/SubkeysPage';
import LogsPage from './components/pages/LogsPage';
import DemoPage from './components/pages/DemoPage';
import HealthPage from './components/pages/HealthPage';
import NotificationsPage from './components/pages/NotificationsPage';

const API = import.meta.env.VITE_API_URL || 'https://keygate-backend.onrender.com';
const fmtNum = (n) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || 0));
const fmtTime = (ts) => (!ts ? '—' : new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
const fmtDate = (ts) => (!ts ? 'Never' : new Date(ts * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
const quotaColor = (used, limit) => (((used / limit) * 100 > 90) ? 'over' : ((used / limit) * 100 > 70) ? 'warn' : 'ok');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const { page, view, projectSlug, go, isPublicHealth } = useConsoleRouteState();
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showPlanBanner, setShowPlanBanner] = useState(true);
  const [subkeys, setSubkeys] = useState([]);
  const [masterKeys, setMasterKeys] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState({ totalRequests: 0, totalTokens: 0, avgLatency: '—', logs: [] });
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'success' });
  const [modal, setModal] = useState('');
  const [revealedToken, setRevealedToken] = useState('—');
  const [providers, setProviders] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notify = (msg, type = 'success') => { setNotif({ show: true, msg, type }); setTimeout(() => setNotif((v) => ({ ...v, show: false })), 3000); };
  const copyText = (text) => navigator.clipboard.writeText(text).then(() => notify('Copied to clipboard'));

  const api = async (path, opts = {}) => {
    const hasBody = opts.body !== undefined;
    const headers = {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(projectSlug ? { 'x-project-id': projectSlug } : {}),
      ...opts.headers
    };
    const res = await fetch(API + path, { ...opts, headers, body: hasBody ? JSON.stringify(opts.body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.error || `HTTP ${res.status}`);
      err.code = data?.error?.code || null;
      throw err;
    }
    return data;
  };

  const loadProviders = async () => { const res = await api('/api/providers', { headers: {} }); setProviders(res.providers || []); return res.providers || []; };

  const loadProjects = async () => {
    const rows = await api('/api/projects', { headers: {} });
    setProjects(rows);
    return rows;
  };
  const loadOverview = async () => { const [sks, an] = await Promise.all([api('/api/subkeys'), api('/api/analytics')]); setSubkeys(sks); setLogs(an.logs || []); setAnalytics(an); };
  const loadMasterKeys = async () => setMasterKeys(await api('/api/master-keys'));
  const loadSubkeys = async () => setSubkeys(await api('/api/subkeys'));
  const loadLogs = async () => { const an = await api('/api/analytics'); setLogs(an.logs || []); setAnalytics(an); };

  useEffect(() => {
    if (isPublicHealth) return;
    loadProviders().catch(() => {});
    loadProjects().then((ps) => {
      const list = ps || [];
      if (!list.length) {
        if (view !== 'create') go('/console/new');
        return;
      }
      if (window.location.pathname === '/') { go('/console'); return; }
      if (view === 'create' && list.length >= 3) { go('/console'); return; }
      if (projectSlug && !list.find((p) => p.slug === projectSlug || p.id === projectSlug)) {
        notify('Project not found', 'error');
        go('/console');
      }
    }).catch((e) => notify(e.message, 'error'));
  }, [projectSlug, view, isPublicHealth]);

  useEffect(() => {
    if (!projectSlug || view !== 'console') return;
    if (page === 'overview') loadOverview().catch((e) => notify(e.message, 'error'));
    if (page === 'masterkeys') loadMasterKeys().catch((e) => notify(e.message, 'error'));
    if (page === 'subkeys') loadSubkeys().catch((e) => notify(e.message, 'error'));
    if (page === 'logs') loadLogs().catch((e) => notify(e.message, 'error'));
    if (page === 'demo' || page === 'notifications') loadSubkeys().catch((e) => notify(e.message, 'error'));
  }, [page, projectSlug]);

  const navigate = async (p) => go(`/console/${projectSlug}/${p}`);

  const ctx = useMemo(() => ({ API, providers, loadProviders, fmtNum, fmtTime, fmtDate, quotaColor, sleep, api, notify, copyText, modal, setModal, revealedToken, setRevealedToken, loadMasterKeys, loadSubkeys, loadLogs, loadOverview, subkeys, setSubkeys, masterKeys, logs, analytics, page }), [modal, subkeys, masterKeys, logs, analytics, revealedToken, page, projectSlug, providers]);

  const createProject = async () => {
    if (projects.length >= 3) return notify('Maximum 3 projects allowed for now', 'error');
    const p = await api('/api/projects', { method: 'POST', body: { name: projectName }, headers: {} });
    setProjectName('');
    await loadProjects();
    go(`/console/${p.slug}/overview`);
  };

  const selectedProject = projects.find((p) => p.slug === projectSlug || p.id === projectSlug);
  const filteredProjects = projects.filter((p) => `${p.name} ${p.slug} ${p.id}`.toLowerCase().includes(projectSearch.toLowerCase()));
  const expectedDeleteText = projectToDelete ? `delete ${projectToDelete.slug}` : '';
  const canDeleteProject = projectToDelete && deleteConfirm.trim() === expectedDeleteText;

  const deleteProject = async () => {
    if (!canDeleteProject || !projectToDelete) return;
    try {
      const ref = encodeURIComponent(projectToDelete.slug || projectToDelete.id);
      const attempts = [
        { path: `/api/projects/by-slug/${ref}`, method: 'DELETE' },
        { path: `/api/projects/${encodeURIComponent(projectToDelete.id)}`, method: 'DELETE' },
      ];
      let deleted = false;
      for (const attempt of attempts) {
        const res = await fetch(API + attempt.path, {
          method: attempt.method,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data?.success !== false)) {
          deleted = true;
          break;
        }
      }
      if (!deleted) throw new Error('Failed to delete project');
      setDeleteConfirm('');
      setProjectToDelete(null);
      notify('Project deleted');
      const ps = await loadProjects();
      if (!ps.length) go('/console/new'); else go('/console');
    } catch (e) {
      notify(e.message || 'Failed to delete project', 'error');
    }
  };

  if (isPublicHealth) {
    const publicCtx = { ...ctx, api: (path, opts = {}) => api(path, { ...opts, headers: {} }) };
    return <HealthPage ctx={publicCtx} publicMode />;
  }

  if (view === 'create') {
    return <div className='page active' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className='card' style={{ maxWidth: 480, width: '100%', margin: '0 auto', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, margin: '0 auto 12px' }}>
            <path d="M12 2.5 3 6v5c0 5 3.5 9 9 10 5.5-1 9-5 9-10V6l-9-3.5Z"/>
            <path d="M9 12.5 11 14.5 15 9.5"/>
          </svg>
          <div className='card-title' style={{ fontSize: 18 }}>Create your first project</div>
          <div className='card-sub' style={{ marginTop: 6 }}>Projects are isolated workspaces for your API keys and usage data.</div>
        </div>
        <div className='field'><label>Project name</label><input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder='e.g. Acme Production' autoFocus /></div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>Project slug is auto-generated. You can create up to <strong style={{ color: 'var(--text)' }}>3 projects</strong> on the Free plan.</div>
        <div className='modal-footer' style={{ marginTop: 24 }}><button className='btn btn-primary' style={{ width: '100%', justifyContent: 'center', minHeight: 44 }} onClick={createProject} disabled={!projectName.trim()}>Create project</button></div>
      </div>
      <div className={`notif ${notif.show ? 'show' : ''} ${notif.type}`}>{notif.msg}</div>
    </div>;
  }

  if (view === 'select' || !projectSlug) {
    return <div className='page active console-select-page'>
      <div className='console-select-content'>
        <header className='console-landing-header'>
          <div>
            <h1>Projects Console</h1>
            <p>Create, switch, and manage isolated workspaces</p>
          </div>
          <div className='console-top-bar'>
            <div className='console-plan-badge'><span className='console-plan-dot' /> Free plan <span>{projects.length} / 3 projects</span></div>
            <button className='btn btn-primary console-create-btn' disabled={projects.length>=3} onClick={()=>go('/console/new')}>+ New project</button>
          </div>
        </header>

        <div className='console-search-section'>
          <input className='projects-search console-search-input' value={projectSearch} onChange={(e)=>setProjectSearch(e.target.value)} placeholder='Search by name, label, or ID' />
        </div>

        <div className={`card projects-banner console-info-banner ${showPlanBanner ? '' : 'hidden'}`}>
          <div className='console-banner-text'>Your Free plan includes up to 3 projects and limited resources.</div>
          <button className='btn btn-ghost btn-sm console-banner-link' style={{marginTop:8}}>Upgrade to Pro</button>
          <button className='banner-close' onClick={() => setShowPlanBanner(false)} aria-label='Close banner'>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M4 4 12 12"/><path d="M12 4 4 12"/></svg>
          </button>
        </div>

        <div className='console-project-count'>Total: <strong>{projects.length} / 3</strong> projects</div>

        <div className='projects-grid console-projects-grid'>
          {filteredProjects.map((p)=><button key={p.id} className='card project-card console-project-card' onClick={()=>go(`/console/${p.slug}/overview`)}>
            <div className='console-project-card-header'>
              <h3>{p.name}</h3>
              <span className={`badge ${p.status==='active'?'active':'paused'}`}>{p.status}</span>
            </div>
            <div className='console-project-card-body'>
              <div className='console-project-id'>{p.slug}</div>
              <div className='console-project-date'>Created {fmtDate(p.created_at)}</div>
            </div>
            <div className='console-project-card-footer'>
              <span />
              <span className='project-delete console-project-delete' onClick={(e)=>{e.stopPropagation(); setProjectToDelete(p); setDeleteConfirm('');}}>Delete</span>
            </div>
          </button>)}
        </div>

        <div className={`modal-backdrop ${projectToDelete ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setProjectToDelete(null)}>
          <div className='modal'>
            <div className='modal-title'>Delete project</div>
            <div className='danger-box'>
              This action is irreversible all the things related to this projects will be deleted and issued keys will stop working.
            </div>
            <div className='field' style={{marginTop:12}}>
              <label>Type "{expectedDeleteText}" to continue</label>
              <input value={deleteConfirm} onChange={(e)=>setDeleteConfirm(e.target.value)} placeholder='delete project-xxxx' />
            </div>
            <div className='modal-footer'>
              <button className='btn btn-ghost' onClick={()=>setProjectToDelete(null)}>Cancel</button>
              <button className='btn btn-danger' disabled={!canDeleteProject} onClick={deleteProject}>Delete project permanently</button>
            </div>
          </div>
        </div>
        <div className={`notif ${notif.show ? 'show' : ''} ${notif.type}`}>{notif.msg}</div>
      </div>
    </div>;
  }

  return (
    <div className='app-shell'>
      <ConsoleHeader
        page={page}
        selectedProject={selectedProject}
        projectSlug={projectSlug}
        onSwitchProject={() => go('/console')}
        onOpenMobileMenu={() => setMobileMenuOpen((open) => !open)}
        onOpenNotifications={() => navigate('notifications')}
        mobileMenuOpen={mobileMenuOpen}
      />
      <div className='app-body'>
        <Sidebar
          page={page}
          navigate={navigate}
          onBackToConsole={() => go('/console')}
          drawerOpen={mobileMenuOpen}
          setDrawerOpen={setMobileMenuOpen}
        />
        <main className='main'>
          <div key={page} className='page-transition'>
            {page === 'overview' && <OverviewPage navigate={navigate} ctx={ctx} />}
            {page === 'masterkeys' && <MasterKeysPage ctx={ctx} />}
            {page === 'subkeys' && <SubkeysPage ctx={ctx} />}
            {page === 'logs' && <LogsPage ctx={ctx} />}
            {page === 'demo' && <DemoPage ctx={ctx} />}
            {page === 'health' && <HealthPage ctx={ctx} />}
            {page === 'notifications' && <NotificationsPage ctx={ctx} />}
          </div>
        </main>
      </div>
      <div className={`notif ${notif.show ? 'show' : ''} ${notif.type}`}>{notif.msg}</div>
    </div>
  );
}