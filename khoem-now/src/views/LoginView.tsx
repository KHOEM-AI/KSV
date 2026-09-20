import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { loginWithPassword, verifyMFA } from '@/lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: '1px solid #2a3550',
  background: '#0a0e17',
  color: '#fff',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 6,
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  fontWeight: 600,
};

interface Props {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginView({ onLoginSuccess, onSwitchToRegister }: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('admin@ksv.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // MFA challenge state
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState<string | undefined>(undefined);
  const [code, setCode] = useState('');

  const storeTokenAndFinish = (token: { accessToken: string }) => {
    localStorage.setItem('ksv_access_token', token.accessToken);
    onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword({ email, password });

      if (res.result === 'mfa_required' && res.mfaChallenge) {
        setChallengeId(res.mfaChallenge.challengeId);
        setMaskedDestination(res.mfaChallenge.maskedDestination);
        return;
      }

      if (res.token) {
        storeTokenAndFinish(res.token);
        return;
      }

      setError(res.message || 'Login failed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await verifyMFA({ challengeId, code });
      if (res.success && res.token) {
        storeTokenAndFinish(res.token);
        return;
      }
      setError(
        res.message ||
          (res.attemptsRemaining !== undefined
            ? `Invalid code. ${res.attemptsRemaining} attempts remaining.`
            : 'Invalid code')
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setChallengeId(null);
    setMaskedDestination(undefined);
    setCode('');
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17' }}>
      {!challengeId ? (
        <form onSubmit={handleSubmit} style={{ background: '#131a29', padding: 32, borderRadius: 12, width: 320 }}>
          <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 20 }}>{t('view.login.title')}</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={inputStyle}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ width: '100%', padding: 8, marginTop: 10, background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
          >
            Don't have an account? Sign up
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} style={{ background: '#131a29', padding: 32, borderRadius: 12, width: 320 }}>
          <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Two-Factor Verification</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
            {maskedDestination
              ? `Enter the code sent to ${maskedDestination}`
              : 'Enter the code from your authenticator app'}
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
            style={{ ...inputStyle, letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading || code.length < 6} style={buttonStyle}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={backToLogin}
            style={{ width: '100%', padding: 8, marginTop: 10, background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
          >
            ← Back to login
          </button>
        </form>
      )}
    </div>
  );
}
