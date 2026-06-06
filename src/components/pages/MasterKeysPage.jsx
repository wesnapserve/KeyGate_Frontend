import { useState } from 'react';
import '../styles/MasterKeysPage.css';
import { FALLBACK_PROVIDERS, providerLabel, providerPlaceholder } from '../../lib/providers';

const providerColors = {
  openai: '#000',
  google: '#4285F4',
  anthropic: '#F97316',
  deepseek: '#0EA5E9',
  xai: '#000',
  groq: '#8B5CF6',
};

const providerInitials = {
  openai: 'O',
  google: 'G',
  anthropic: 'A',
  deepseek: 'D',
  xai: 'X',
  groq: 'G',
};

function ProviderBadge({ provider, label }) {
  const color = providerColors[provider] || '#6366f1';
  return (
    <span
      className='provider-badge'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: `${color}15`,
        padding: '3px 10px',
        borderRadius: 20,
        border: `1px solid ${color}30`,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label || provider}
    </span>
  );
}

function ProviderAvatar({ provider }) {
  const color = providerColors[provider] || '#6366f1';
  const initial = providerInitials[provider] || '?';
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: '#fff',
      flexShrink: 0,
      boxShadow: `0 4px 12px ${color}40`,
    }}>
      {initial}
    </div>
  );
}

const IconShield = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0, color: 'var(--amber)' }}>
    <path d="M10 2.5 3 5v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V5l-7-2.5Z"/>
    <path d="M8 10.5 9.5 12 12 8.5"/>
  </svg>
);

const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, opacity: 0.4, marginBottom: 8 }}>
    <path d="M15.5 3.5a4.5 4.5 0 1 0 2.8 8h0l2.7 2.7v3h-3v2h-3v2h-5"/>
    <path d="M8 17.5 3 22.5"/>
    <path d="M6.5 19 5 20.5"/>
    <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
  </svg>
);

export default function MasterKeysPage({ ctx }) {
  const { masterKeys, api, loadMasterKeys, notify, fmtDate, modal, setModal, providers = FALLBACK_PROVIDERS } = ctx;
  const providerOptions = providers.length ? providers : FALLBACK_PROVIDERS;
  const [provider, setProvider] = useState('openai');
  const [keyName, setKeyName] = useState('Primary OpenAI Key');
  const [apiKey, setApiKey] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const onProviderChange = (next) => {
    setProvider(next);
    setKeyName(`Primary ${providerLabel(providerOptions, next)} Key`);
  };

  const saveMasterKey = async () => {
    if (!apiKey.trim()) return notify('Enter an API key', 'error');
    await api('/api/master-keys', { method: 'POST', body: { provider, name: keyName.trim(), api_key: apiKey.trim() } });
    setApiKey(''); onProviderChange('openai'); setModal(''); notify('Master key saved — encrypted'); loadMasterKeys();
  };

  const deleteMasterKey = async (mk) => {
    const okay = window.confirm(`Delete master key "${mk.name || mk.provider}"?\n\nThis cannot be undone. Related subkeys may stop working if they depend on this key.`);
    if (!okay) return;
    setDeletingId(mk.id);
    try {
      await api(`/api/master-keys/${mk.id}`, { method: 'DELETE' });
      notify('Master key deleted');
      await loadMasterKeys();
    } finally {
      setDeletingId('');
    }
  };

  return <div className='page active'>
    <div className='page-header mobile-header-stack' style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}><div><div className='page-title'>Master keys</div><div className='page-sub'>Your real provider API keys — stored encrypted, never exposed</div></div><button className='btn btn-primary' onClick={() => setModal('addkey')}>+ Add key</button></div>
    <div className='card' style={{ background: '#ffb54708', borderColor: '#ffb54720' }}><div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}><IconShield /><div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>Keys are encrypted at rest</div><div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>Your master keys are encrypted before storage. They are never returned in any API response, never logged, and only injected server-side at request time. Your clients only ever see subkeys.</div></div></div></div>
    {!masterKeys.length
      ? <div className='empty' style={{ padding: '48px 20px', textAlign: 'center' }}><IconKey /><div className='empty-text'>No master keys configured</div><button className='btn btn-primary' onClick={() => setModal('addkey')}>Add your first key</button></div>
      : masterKeys.map((mk) => <div className='card' key={mk.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}><ProviderAvatar provider={mk.provider} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{mk.name || providerLabel(providerOptions, mk.provider)}</div><div className='token-val' style={{ fontSize: 12, color: 'var(--muted)' }}>{mk.key_masked}</div></div><div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><div style={{ fontSize: 12, color: 'var(--dim)', whiteSpace: 'nowrap' }}>Added {fmtDate(mk.created_at)}</div><ProviderBadge provider={mk.provider} label={providerLabel(providerOptions, mk.provider)} /><button className='btn btn-sm btn-danger' disabled={deletingId === mk.id} onClick={() => deleteMasterKey(mk)}>{deletingId === mk.id ? 'Deleting...' : 'Delete'}</button></div></div>)}

    <div className={`modal-backdrop ${modal === 'addkey' ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setModal('')}><div className='modal'><div className='modal-title'>Add provider key</div><div className='form-row single'><div className='field'><label>Name for master key</label><input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder='e.g. Production OpenAI Key' /></div></div><div className='form-row single'><div className='field'><label>Provider</label><select value={provider} onChange={(e) => onProviderChange(e.target.value)}>{providerOptions.map((p)=><option key={p.id} value={p.id}>{p.label}</option>)}</select></div></div><div className='form-row single'><div className='field'><label>API key</label><input type='password' value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={providerPlaceholder(providerOptions, provider)} autoComplete='off' /></div></div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>This key will be encrypted immediately. You won't be able to retrieve it — only replace it.</div><div className='modal-footer'><button className='btn btn-ghost' onClick={() => setModal('')}>Cancel</button><button className='btn btn-primary' onClick={saveMasterKey}>Save encrypted key</button></div></div></div>
  </div>;
}