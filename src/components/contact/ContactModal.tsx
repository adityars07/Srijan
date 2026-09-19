import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.contact.submit({ name, email, phone, message });
      setSubmitted(true);
      showToast('Your message has been sent directly to Rakhi!');
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-container"
        style={{ maxWidth: '780px', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
          {/* Left Info Column */}
          <div style={{ backgroundColor: '#2B2523', color: '#FBF9F5', padding: '36px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C48B71', fontWeight: 600, marginBottom: '8px' }}>
                Get In Touch
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', lineHeight: 1.15, marginBottom: '14px' }}>
                Let's Create Together
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#BDB3A6', lineHeight: 1.6, marginBottom: '28px' }}>
                Reach out for bespoke wedding gifts, custom resin keepsakes, personalized nameplates, or studio visits.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.88rem' }}>
                <a
                  href="mailto:rakhikarn20001@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FBF9F5' }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} color="#C48B71" />
                  </div>
                  <span>rakhikarn20001@gmail.com</span>
                </a>

                <a
                  href="tel:+919711881512"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FBF9F5' }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} color="#C48B71" />
                  </div>
                  <span>+91 9711881512</span>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FBF9F5' }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C48B71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </div>
                  <span>@srijan_handcraftedbyrakhi</span>
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FBF9F5' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} color="#C48B71" />
                  </div>
                  <span>Studio Srijan, India</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#9E968E', marginTop: '24px' }}>
              Rakhi personally replies within 24 hours.
            </div>
          </div>

          {/* Right Form Column */}
          <div style={{ padding: '36px 32px', backgroundColor: 'white', position: 'relative' }}>
            <button
              className="icon-action-btn"
              onClick={onClose}
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              aria-label="Close contact dialog"
            >
              <X size={20} />
            </button>

            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '18px' }}>
              Send a Message
            </h4>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={44} color="#2E7D32" style={{ margin: '0 auto 12px' }} />
                <h5 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Message Received!</h5>
                <p style={{ fontSize: '0.88rem', color: '#746D66' }}>
                  Thank you for reaching out. Rakhi will review your request and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Custom Requirements or Message *</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about color preferences, custom inscriptions, or dimensions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="checkout-action-btn"
                  style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
