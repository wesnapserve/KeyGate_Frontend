import PublicLayout from './PublicLayout';
import { company, legalLinks } from './marketingContent';

const features = [
  ['Safe subkeys', 'Convert provider API keys into revocable subkeys for teams, customers, and vendors.'],
  ['Spend controls', 'Set token ceilings, max request counts, rate limits, expiry windows, and model allowlists.'],
  ['Audit-ready logs', 'Track requests, token usage, latency, provider errors, and estimated cost attribution.'],
];

const plans = [
  ['Free', '$0', 'For evaluation and small internal projects.'],
  ['Pro', '$19', 'For production sharing with larger token and project limits.'],
  ['Scale', '$99', 'For teams needing higher limits and organization controls.'],
  ['Enterprise', 'Custom', 'For advanced governance, compliance, and dedicated support.'],
];

export default function LandingPage() {
  const go = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new Event('popstate')); };
  return (
    <PublicLayout>
      <section className='landing-hero'>
        <div>
          <span className='eyebrow'>API access governance</span>
          <h1>Share API access without sharing your real API keys.</h1>
          <p>{company.name} turns master provider keys into scoped subkeys with revocation, rate limiting, token limits, expiry controls, and analytics.</p>
          <div className='landing-actions'>
            <button className='btn btn-primary' onClick={() => go('/console')}>Launch console</button>
            <button className='btn btn-ghost' onClick={() => go('/terms-and-conditions')}>View policies</button>
          </div>
        </div>
        <div className='landing-card card'>
          <div className='card-title'>Live governance controls</div>
          <div className='landing-metric'><span>Revocation</span><strong>Instant</strong></div>
          <div className='landing-metric'><span>Rate limits</span><strong>Per subkey</strong></div>
          <div className='landing-metric'><span>Token limits</span><strong>Monthly</strong></div>
          <div className='landing-metric'><span>Logs</span><strong>Auditable</strong></div>
        </div>
      </section>

      <section className='public-section'>
        <h2>Built for controlled API access sharing</h2>
        <div className='public-card-grid'>
          {features.map(([title, text]) => <article className='card' key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className='public-section' id='pricing'>
        <h2>Plans</h2>
        <p className='public-muted'>Pricing is subscription based. Payments are processed by Razorpay where available.</p>
        <div className='public-card-grid public-pricing-grid'>
          {plans.map(([name, price, text]) => <article className='card' key={name}><h3>{name}</h3><div className='public-price'>{price}</div><p>{text}</p></article>)}
        </div>
      </section>

      <section className='public-section' id='contact'>
        <h2>Contact and compliance pages</h2>
        <p className='public-muted'>For billing, account, refund, cancellation, or payment verification questions, contact <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>.</p>
        <div className='public-link-list'>
          {legalLinks.map(([label, href]) => <button key={href} onClick={() => go(href)}>{label}</button>)}
        </div>
      </section>
    </PublicLayout>
  );
}
