import { useEffect, useState } from 'react';

export function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    if (!window.history.state) window.history.replaceState({}, '', path);
    return () => window.removeEventListener('popstate', onPop);
  }, [path]);

  const go = (to: string) => {
    if (to === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (to.startsWith('/#')) {
      const hash = to.slice(2);
      if (path !== '/') {
        window.history.pushState({}, '', '/');
        setPath('/');
        setTimeout(() => scrollToId(hash), 30);
      } else {
        scrollToId(hash);
      }
      return;
    }
    if (/^https?:\/\//.test(to)) {
      window.open(to, '_blank', 'noopener');
      return;
    }
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0 });
  };

  return { path, go };
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function navigate(to: string) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('popstate'));
}
