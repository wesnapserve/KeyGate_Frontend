import { useRoute } from './lib/router';
import { policyByPath } from './lib/legal';
import LandingPage from './components/LandingPage';
import PolicyPage from './components/PolicyPage';

function NotFound() {
  const { go } = useRoute();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-slate-900">404</div>
        <p className="mt-2 text-slate-600">Page not found</p>
        <button
          onClick={() => go('/')}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back home
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { path } = useRoute();

  if (path === '/' || path === '') return <LandingPage />;

  const policy = policyByPath(path);
  if (policy) return <PolicyPage policyKey={policy.key as any} />;

  if (path === '/contact') {
    window.location.href = 'mailto:support@lethem.app';
  }

  return <NotFound />;
}
