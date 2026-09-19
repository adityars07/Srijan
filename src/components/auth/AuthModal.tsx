import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const { showToast } = useCart();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Successfully signed in! Welcome back.');
      } else {
        await register(name, email, password, phone);
        showToast('Account created successfully! Welcome to Srijan.');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-container"
        style={{ maxWidth: '480px', padding: '36px 32px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F4EFEA',
              color: '#C48B71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Sparkles size={22} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginBottom: '6px' }}>
            {mode === 'login' ? 'Welcome to Srijan' : 'Create Your Account'}
          </h3>
          <p style={{ color: '#746D66', fontSize: '0.88rem' }}>
            {mode === 'login'
              ? 'Sign in to access your orders, saved wishlists, and studio commissions.'
              : 'Join the Srijan artisan family to personalize and order handcrafted art.'}
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#F4EFEA',
            padding: '4px',
            borderRadius: '9999px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'login' ? '#2B2523' : 'transparent',
              color: mode === 'login' ? '#FBF9F5' : '#746D66',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'register' ? '#2B2523' : 'transparent',
              color: mode === 'register' ? '#FBF9F5' : '#746D66',
              transition: 'all 0.2s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#FDEDEC',
              color: '#C0392B',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#2B2523' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="#746D66" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid #EBE4DA',
                    fontSize: '0.9rem',
                    backgroundColor: '#FBF9F5',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#2B2523' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#746D66" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #EBE4DA',
                  fontSize: '0.9rem',
                  backgroundColor: '#FBF9F5',
                }}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#2B2523' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#746D66" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid #EBE4DA',
                    fontSize: '0.9rem',
                    backgroundColor: '#FBF9F5',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#2B2523' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#746D66" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #EBE4DA',
                  fontSize: '0.9rem',
                  backgroundColor: '#FBF9F5',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              padding: '12px 20px',
              borderRadius: '9999px',
              backgroundColor: '#2B2523',
              color: '#FBF9F5',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <span>{isSubmitting ? 'Verifying...' : mode === 'login' ? 'Sign In to Studio' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Logins Helper */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #EBE4DA' }}>
          <div style={{ fontSize: '0.74rem', color: '#8C827A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', textAlign: 'center', fontWeight: 600 }}>
            Quick Demo Accounts (1-Click Fill)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@srijan.com', 'ArtisanRakhi2026!')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #EBE4DA',
                background: '#FDFBF7',
                fontSize: '0.78rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="#C48B71" />
              <div>
                <strong style={{ display: 'block', color: '#2B2523' }}>Artisan Admin</strong>
                <span style={{ fontSize: '0.72rem', color: '#746D66' }}>Rakhi Karn</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('demo@srijan.com', 'Customer2026!')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #EBE4DA',
                background: '#FDFBF7',
                fontSize: '0.78rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <UserIcon size={14} color="#746D66" />
              <div>
                <strong style={{ display: 'block', color: '#2B2523' }}>Demo Customer</strong>
                <span style={{ fontSize: '0.72rem', color: '#746D66' }}>Aditya Kumar</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
