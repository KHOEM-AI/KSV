import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { loginWithPassword } from '@/lib/api';

export function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('admin@ksv.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithPassword({ email, password });
      if (res.token) {
        localStorage.setItem('ksv_access_token', res.token.accessToken);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17' }}>
      <form onSubmit={handleSubmit} style={{ background: '#131a29', padding: 32, borderRadius: 12, width: 320 }}>
        <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 20 }}>{t('view.login.title')}</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #2a3550', background: '#0a0e17', color: '#fff' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #2a3550', background: '#0a0e17', color: '#fff' }}
        />
        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, borderRadius: 6, background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600 }}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
