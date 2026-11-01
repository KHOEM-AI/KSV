import { useState } from 'react';
import { Panel } from '@/components/ui';
import { loginWithPassword, verifyMFA } from '@/lib/api';

const EMAIL_KEY = 'ksv_account_email';

const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', marginBottom: 10, borderRadius: 8,
  border: '1px solid #2a3550', background: '#0a0e17', color: '#fff', boxSizing: 'border-box',
};
const btn: React.CSSProperties = {
  width: '100%', padding: 10, borderRadius: 8, background: '#3b82f6',
  color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
};
const ghost: React.CSSProperties = {
  width: '100%', padding: 8, marginTop: 8, background: 'transparent',
  border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
};

export function AccountSignInCard() {
  const signedIn = !!localStorage.getItem('ksv_access_token');
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finish = (accessToken: string) => {
    localStorage.setItem('ksv_access_token', accessToken);
    localStorage.setItem(EMAIL_KEY, email);
    window.location.reload();
  };

  const signOut = () => {
    localStorage.removeItem('ksv_access_token');
    window.location.reload();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword({ email, password });
      if (res.result === 'mfa_required' && res.mfaChallenge) {
        setChallengeId(res.mfaChallenge.challengeId);
        return;
      }
      if (res.token) { finish(res.token.accessToken); return; }
      setError(res.message || 'Login failed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyMFA({ challengeId, code });
      if (res.success && res.token) { finish(res.token.accessToken); return; }
      setError(res.message || 'Invalid code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (signedIn) {
    return (
      <Panel className="p-5">
        <p style={{ color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>✓ បានចូលគណនី</p>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>{email || 'KSV'}</p>
        <button type="button" onClick={signOut} style={{ ...btn, background: '#334155' }}>ចាកចេញ</button>
      </Panel>
    );
  }

  return (
    <Panel className="p-5">
      <div style={{ maxWidth: 360 }}>
        <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>ចូលគណនី</h3>
        {!challengeId ? (
          <form onSubmit={submit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={input} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={input} />
            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button type="submit" disabled={loading} style={btn}>{loading ? 'Logging in…' : 'Log in'}</button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>បញ្ចូលកូដបញ្ជាក់ ៦ ខ្ទង់</p>
            <input type="text" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} style={{ ...input, letterSpacing: 4, textAlign: 'center', fontSize: 18 }} />
            {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button type="submit" disabled={loading || code.length < 6} style={btn}>{loading ? 'Verifying…' : 'Verify'}</button>
            <button type="button" onClick={() => { setChallengeId(null); setCode(''); setError(null); }} style={ghost}>← ត្រឡប់ក្រោយ</button>
          </form>
        )}
      </div>
    </Panel>
  );
}
