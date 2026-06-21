import { LogoFull } from '../src/components/parts/Logo';
import { company, legalLinks } from './marketingContent';

export default function PublicLayout({ children, compact = false }) {
  const go = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new Event('popstate')); };
  return (
    <div className='public-site'>
      <header className='public-nav'>
        <button className='public-brand' onClick={() => go('/')} aria-label='Lethem home'><LogoFull size={22} /></button>
        <nav>
          <button onClick={() => go('/#pricing')}>Pricing</button>
          <button onClick={() => go('/#contact')}>Contact</button>
          <button className='btn btn-ghost btn-sm' onClick={() => go('/console')}>Sign in</button>
          <button className='btn btn-primary btn-sm' onClick={() => go('/console')}>Open console</button>
        </nav>
      </header>
      <main className={compact ? 'public-main public-main-compact' : 'public-main'}>{children}</main>
      <footer className='public-footer'>
        <div>
          <strong>{company.name}</strong>
          <p>Secure API key sharing with revocation, rate limits, token limits, request logs, and billing-aware governance.</p>
          <p>{company.address} · <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a></p>
        </div>
        <div className='public-footer-links'>
          {legalLinks.map(([label, href]) => <button key={href} onClick={() => go(href)}>{label}</button>)}
        </div>
      </footer>
    </div>
  );
}
