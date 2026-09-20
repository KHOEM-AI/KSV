import {
  FaGoogle,
  FaFacebook,
  FaTiktok,
  FaApple,
  FaMicrosoft,
  FaGithub,
  FaXTwitter,
} from 'react-icons/fa6';

export type SignupProvider =
  | 'google'
  | 'facebook'
  | 'tiktok'
  | 'apple'
  | 'microsoft'
  | 'github'
  | 'x';

interface ProviderOption {
  id: SignupProvider;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const PROVIDERS: ProviderOption[] = [
  { id: 'google', label: 'Google', icon: FaGoogle, color: '#ea4335' },
  { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: '#1877f2' },
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
  { id: 'apple', label: 'Apple', icon: FaApple, color: '#a3a3a3' },
  { id: 'microsoft', label: 'Microsoft', icon: FaMicrosoft, color: '#00a4ef' },
  { id: 'github', label: 'GitHub', icon: FaGithub, color: '#ffffff' },
  { id: 'x', label: 'X', icon: FaXTwitter, color: '#ffffff' },
];

interface Props {
  onSelect: (provider: SignupProvider) => void;
}

export default function ProviderSelectScreen({ onSelect }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e17',
        padding: 20,
      }}
    >
      <div style={{ background: '#131a29', padding: 32, borderRadius: 12, width: 340 }}>
        <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 4 }}>Sign up with</h1>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 20 }}>
          Choose the account you'll use to sign up. You'll still set your own KSV password next.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PROVIDERS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #2a3550',
                background: '#0a0e17',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <Icon size={18} color={color} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
