import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
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
        showToast('Welcome back! Successfully signed in.');
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-container"
        style={{ maxWidth: '440px', padding: '36px 32px', position: 'relative' }}
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginBottom: '6px' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p style={{ color: '#746D66', fontSize: '0.88rem', lineHeight: '1.5' }}>
            {mode === 'login'
              ? 'Sign in to access your orders, saved wishlists, and studio commissions.'
              : 'Join the Srijan family to order bespoke handcrafted creations and track your deliveries.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#F4EFEA',
            padding: '4px',
            borderRadius: '9999px',
            marginBottom: '22px',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '9px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'login' ? '#2B2523' : 'transparent',
              color: mode === 'login' ? '#FBF9F5' : '#746D66',
              border: 'none',
              cursor: 'pointer',
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
              padding: '9px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'register' ? '#2B2523' : 'transparent',
              color: mode === 'register' ? '#FBF9F5' : '#746D66',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Up
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
                    boxSizing: 'border-box',
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
                  boxSizing: 'border-box',
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
                    boxSizing: 'border-box',
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #EBE4DA',
                  fontSize: '0.9rem',
                  backgroundColor: '#FBF9F5',
                  boxSizing: 'border-box',
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
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In to Srijan' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: '#8C827A' }}>
            {mode === 'login' ? (
              <>
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  style={{ background: 'none', border: 'none', color: '#C48B71', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  style={{ background: 'none', border: 'none', color: '#C48B71', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
