import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, verifyOtp, resendOtp, register } = useAuth();
  const { showToast } = useCart();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Credentials fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // OTP fields
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(true);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Focus first input box on OTP step entry
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.requiresOtp) {
          setVerificationId(res.verificationId || '');
          setMaskedEmail(res.maskedEmail || email);
          setDevOtp(res.devOtp || null);
          setSmtpConfigured(res.smtpConfigured ?? true);
          setStep('otp');
          setResendTimer(60);
          setOtpDigits(['', '', '', '', '', '']);
          showToast(`Verification code sent to ${res.maskedEmail || email}`);
        } else {
          showToast('Welcome back! Successfully signed in.');
          onClose();
          if (onSuccess) onSuccess();
        }
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        await register(name, email, password, phone);
        showToast('Account created successfully! Welcome to Srijan.');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(5, pastedData.length);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await verifyOtp(email, fullOtp, verificationId);
      showToast('Identity verified! Welcome to Srijan.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await resendOtp(email, verificationId);
      if (res.verificationId) {
        setVerificationId(res.verificationId);
      }
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setSmtpConfigured(res.smtpConfigured ?? true);
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast('A fresh verification code has been generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
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

        {step === 'credentials' ? (
          <>
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
            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          </>
        ) : (
          /* STEP 2: Real OTP Verification Screen */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#F4EFEA',
                  color: '#C48B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '6px' }}>
                Verify Your Identity
              </h3>
              <p style={{ color: '#746D66', fontSize: '0.86rem', lineHeight: '1.5' }}>
                Enter the 6-digit verification code sent to:
              </p>
              <div
                style={{
                  marginTop: '4px',
                  display: 'inline-block',
                  background: '#F4EFEA',
                  color: '#2B2523',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                }}
              >
                {maskedEmail || email}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: '#FDEDEC',
                  color: '#C0392B',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            {/* Live SMTP Guidance & Local Dev OTP fallback */}
            {!smtpConfigured && devOtp && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  color: '#92400E',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  marginBottom: '18px',
                  lineHeight: '1.45',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, color: '#B45309', marginBottom: '3px' }}>
                  ℹ️ Live Email Sending Pending Setup
                </div>
                To send emails to your real inbox, add your Gmail App Password in <code>auth-service/.env</code>.
                <div style={{ marginTop: '8px', fontSize: '0.86rem', color: '#1F2937' }}>
                  Your Verification Code: <strong style={{ letterSpacing: '3px', color: '#B45309', fontSize: '1.15rem' }}>{devOtp}</strong>
                </div>
              </div>
            )}

            {/* 6 Discrete Box Inputs */}
            <form onSubmit={handleOtpSubmit}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  marginBottom: '22px',
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: '46px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: digit ? '2px solid #C48B71' : '1.5px solid #EBE4DA',
                      backgroundColor: digit ? '#FFF' : '#FBF9F5',
                      color: '#2B2523',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                style={{
                  width: '100%',
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
                  cursor: isSubmitting || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || otpDigits.join('').length !== 6 ? 0.6 : 1,
                  border: 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: '14px',
                }}
              >
                <span>{isSubmitting ? 'Verifying Code...' : 'Verify & Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Resend Action & Countdown */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {resendTimer > 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#8C827A' }}>
                  Resend verification code in <strong>{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C48B71',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <RefreshCw size={13} className={isResending ? 'spin' : ''} />
                  <span>{isResending ? 'Sending...' : 'Resend Verification Code'}</span>
                </button>
              )}
            </div>

            {/* Back to Login */}
            <div style={{ textAlign: 'center', borderTop: '1px solid #F0ECE6', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#746D66',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to Login / Change Email</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
