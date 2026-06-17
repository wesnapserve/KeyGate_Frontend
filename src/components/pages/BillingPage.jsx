import { useEffect, useMemo, useState } from 'react';

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
  document.body.appendChild(script);
});

export default function BillingPage({ ctx }) {
  const { api, notify } = ctx;
  const [billing, setBilling] = useState(null);
  const [busyPlan, setBusyPlan] = useState('');

  useEffect(() => {
    api('/api/billing/plans').then(setBilling).catch((e) => notify(e.message, 'error'));
  }, []);

  const plans = useMemo(() => billing?.plans || [], [billing]);

  const startCheckout = async (plan) => {
    if (plan.id === 'free') return;
    if (!billing?.keyId) {
      notify('Razorpay key is missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend.', 'error');
      return;
    }
    setBusyPlan(plan.id);
    try {
      await loadRazorpayScript();
      const sub = await api('/api/billing/subscriptions', { method: 'POST', body: { planId: plan.id } });
      const rz = new window.Razorpay({
        key: sub.keyId || billing.keyId,
        name: 'KeyGate',
        description: `${plan.name} monthly subscription`,
        subscription_id: sub.subscriptionId,
        notes: { plan: plan.id },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          await api('/api/billing/verify', { method: 'POST', body: { ...response, planId: plan.id } });
          const fresh = await api('/api/billing/plans');
          setBilling(fresh);
          notify(`You're now on ${plan.name}`);
        },
        modal: { ondismiss: () => setBusyPlan('') },
      });
      rz.open();
    } catch (e) {
      notify(e.message || 'Unable to start checkout', 'error');
    } finally {
      setBusyPlan('');
    }
  };

  if (!billing) return <div className='card'>Loading billing plans…</div>;

  return (
    <div className='billing-page'>
      <div className='page-head'>
        <div>
          <h1>Plans & Billing</h1>
          <p>Test real Razorpay subscription checkout in INR while showing USD-friendly pricing.</p>
        </div>
        <span className='badge active'>{billing.testMode ? 'Razorpay test mode' : 'Razorpay live mode'}</span>
      </div>
      <div className='billing-current card'>
        <div>
          <div className='muted'>Current plan</div>
          <strong>{billing.currentPlan}</strong>
        </div>
        <div>
          <div className='muted'>Subscription</div>
          <strong>{billing.subscriptionStatus}</strong>
        </div>
        <div>
          <div className='muted'>Currency charged</div>
          <strong>{billing.currency}</strong>
        </div>
      </div>
      <div className='pricing-grid'>
        {plans.map((plan) => (
          <div key={plan.id} className={`card pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className='popular-ribbon'>Most Popular</div>}
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <div className='price-line'>
              <span>${plan.monthlyUsd}</span><small>/month</small>
            </div>
            <div className='inr-line'>{plan.monthlyInr ? `₹${plan.monthlyInr.toLocaleString('en-IN')} charged via Razorpay` : 'No payment required'}</div>
            <ul className='pricing-features'>
              {plan.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-ghost'} btn-block`} disabled={plan.id === billing.currentPlan || busyPlan === plan.id} onClick={() => startCheckout(plan)}>
              {plan.id === billing.currentPlan ? 'Current plan' : plan.id === 'free' ? 'Included' : busyPlan === plan.id ? 'Opening checkout…' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
