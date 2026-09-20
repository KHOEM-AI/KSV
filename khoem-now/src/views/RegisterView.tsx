import { useState } from 'react';
import { register } from '@/lib/api';

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
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterView({ onRegisterSuccess, onSwitchToLogin }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!firstName || !lastName || !organizationName || !email || !password) {
      return 'Please fill in all fields.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    if (!hasLetter || !hasNumber || !hasSymbol) {
      return 'Password must include at least one letter, one number, and one symbol.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await register({ email, password, firstName, lastName, organizationName });
      if (res.result === 'success' && res.token) {
        localStorage.setItem('ksv_access_token', res.token.accessToken);
        onRegisterSuccess();
        return;
      }
      setError(res.message || 'Registration failed');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: '#131a29', padding: 32, borderRadius: 12, width: 340 }}>
        <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 4 }}>Create your account</h1>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>
          Password: at least 6 characters, including a letter, a number, and a symbol.
        </p>

        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" style={inputStyle} />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" style={inputStyle} />
        <input type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Organization name" style={inputStyle} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inputStyle} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={inputStyle} />

        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{ width: '100%', padding: 8, marginTop: 10, background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
        >
          Already have an account? Log in
        </button>
      </form>
    </div>
  );
}
