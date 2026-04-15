import { useState } from 'react';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

// Okta SSO mockup — simulates the Okta-hosted login page Klaviyo employees see
// when accessing the Citizen Developer Portal via Google IAP + Okta OIDC.
// In production: portal redirects to Okta → Okta authenticates → redirects back with JWT.

type Phase = 'email' | 'password' | 'mfa' | 'redirecting';

export default function Login() {
  const { login } = useAuth();
  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      setEmailError('There is no account with this email address.');
      return;
    }
    setMatchedUser(found);
    setPhase('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setPhase('mfa'); }, 900);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 6) return;
    setLoading(true);
    setPhase('redirecting');
    setTimeout(() => { if (matchedUser) login(matchedUser); }, 1800);
  };

  const prefillUser = (u: User) => {
    setEmail(u.email);
    setMatchedUser(u);
    setEmailError('');
    setPhase('password');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', padding: '24px 16px' }}>

      {/* Okta blue top stripe */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #007DC1 0%, #00297A 100%)' }} />

      {/* SSO redirect overlay */}
      {phase === 'redirecting' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '40px 48px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#007DC115', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#007DC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a', marginBottom: '8px' }}>Signing you in…</div>
            <div style={{ color: '#6b6b6b', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
              Okta is redirecting you to<br /><strong>Klaviyo Citizen Developer Portal</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#007DC1', opacity: 0.4, animation: `oktaPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
          <style>{`@keyframes oktaPulse { 0%,100%{opacity:0.3;transform:scale(0.85)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {/* Main Okta card */}
      <div style={{ background: '#ffffff', borderRadius: '6px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', width: '100%', maxWidth: '400px', padding: '36px 32px 28px', marginBottom: '12px' }}>

        {/* Okta wordmark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#007DC1', letterSpacing: '-0.5px' }}>okta</div>
        </div>

        {/* App context chip */}
        <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px 12px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '5px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#9FE870', fontWeight: '900', fontSize: '13px' }}>K</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '12px', color: '#1a1a1a' }}>Klaviyo Citizen Developer Portal</div>
            <div style={{ fontSize: '11px', color: '#6b6b6b' }}>klaviyodev.klaviyo.com</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '10px', color: '#6b6b6b' }}>Verified</span>
          </div>
        </div>

        {/* ── EMAIL PHASE ── */}
        {phase === 'email' && (
          <>
            <h1 style={{ fontSize: '19px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>Sign In</h1>
            <p style={{ fontSize: '13px', color: '#6b6b6b', marginBottom: '20px' }}>Sign in with your Klaviyo email address</p>
            <form onSubmit={handleEmailSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="you@klaviyo.com"
                  autoFocus
                  style={{ width: '100%', padding: '9px 11px', fontSize: '14px', border: `1.5px solid ${emailError ? '#ef4444' : '#d1d5db'}`, borderRadius: '4px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' }}
                />
                {emailError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{emailError}</div>}
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px', background: '#007DC1', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Next
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', textAlign: 'center' }}>
                Demo — click to sign in as
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {MOCK_USERS.filter(u => u.status === 'active').map(u => {
                  const isAdmin = u.role === 'admin';
                  const accent = isAdmin ? '#a78bfa' : '#9FE870';
                  return (
                    <button key={u.id} onClick={() => prefillUser(u)} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `${accent}18`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: isAdmin ? '#a78bfa' : '#5a9e2f', flexShrink: 0 }}>
                        {u.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{u.name}</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      </div>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: `${accent}15`, color: isAdmin ? '#a78bfa' : '#5a9e2f', fontWeight: '600', flexShrink: 0 }}>
                        {isAdmin ? 'Admin' : u.team}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── PASSWORD PHASE ── */}
        {phase === 'password' && matchedUser && (
          <>
            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: matchedUser.role === 'admin' ? '#a78bfa20' : '#9FE87020', border: `1px solid ${matchedUser.role === 'admin' ? '#a78bfa40' : '#9FE87040'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: matchedUser.role === 'admin' ? '#a78bfa' : '#5a9e2f', flexShrink: 0 }}>
                {matchedUser.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{matchedUser.name}</div>
                <div style={{ fontSize: '11px', color: '#6b6b6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{matchedUser.email}</div>
              </div>
              <button onClick={() => { setPhase('email'); setPassword(''); }} style={{ fontSize: '12px', color: '#007DC1', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Change</button>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '18px' }}>Enter your password</h1>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Password</label>
                  <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: '12px', color: '#007DC1', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  style={{ width: '100%', padding: '9px 11px', fontSize: '14px', border: '1.5px solid #d1d5db', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }}
                />
              </div>
              <button type="submit" disabled={!password || loading} style={{ width: '100%', padding: '10px', background: password && !loading ? '#007DC1' : '#93c5d8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: password && !loading ? 'pointer' : 'not-allowed' }}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>
            <div style={{ marginTop: '12px', padding: '8px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px', color: '#92400e', textAlign: 'center' }}>
              <strong>Demo:</strong> Enter any password to continue
            </div>
          </>
        )}

        {/* ── MFA PHASE ── */}
        {phase === 'mfa' && matchedUser && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#007DC115', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#007DC1" strokeWidth="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#007DC1" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="#007DC1"/></svg>
              </div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' }}>Verify it's you</h1>
              <p style={{ fontSize: '13px', color: '#6b6b6b', lineHeight: '1.5' }}>
                Enter the 6-digit code from your<br /><strong>Okta Verify</strong> app
              </p>
            </div>
            <form onSubmit={handleMfaSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', fontSize: '22px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700', letterSpacing: '0.35em', textAlign: 'center', border: '1.5px solid #d1d5db', borderRadius: '4px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }}
                />
                <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '5px' }}>
                  Code expires in <span style={{ color: '#007DC1', fontWeight: '600' }}>4:58</span>
                </div>
              </div>
              <button type="submit" disabled={mfaCode.length < 6} style={{ width: '100%', padding: '10px', background: mfaCode.length === 6 ? '#007DC1' : '#93c5d8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: mfaCode.length === 6 ? 'pointer' : 'not-allowed' }}>
                Verify
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: '12px', color: '#007DC1', textDecoration: 'none' }}>Use a different factor</a>
              </div>
            </form>
            <div style={{ marginTop: '12px', padding: '8px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '11px', color: '#92400e', textAlign: 'center' }}>
              <strong>Demo:</strong> Enter any 6 digits to proceed
            </div>
          </>
        )}
      </div>

      {/* Okta footer */}
      <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
        <span>© 2026 Okta, Inc. All rights reserved.</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <a href="#" onClick={e => e.preventDefault()} style={{ color: '#007DC1', textDecoration: 'none' }}>Privacy Policy</a>
        <span style={{ margin: '0 8px' }}>·</span>
        <a href="#" onClick={e => e.preventDefault()} style={{ color: '#007DC1', textDecoration: 'none' }}>Terms of Service</a>
      </div>
    </div>
  );
}
