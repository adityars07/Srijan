import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface FooterProps {
  onNavigate: (view: 'home' | 'shop' | 'about' | 'checkout' | 'admin' | 'tracking', category?: string) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenContact }) => {
  const { showToast } = useCart();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to Srijan journal!');
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="brand-logo" onClick={() => onNavigate('home')}>
              <div className="brand-icon-glyph">
                <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M16 6 C12 11 12 21 16 26" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M16 6 C20 11 20 21 16 26" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M6 16 C11 12 21 12 26 16" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M6 16 C11 20 21 20 26 16" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <span className="brand-name" style={{ fontSize: '1.5rem' }}>Srijan</span>
            </div>
            <p className="footer-desc">
              Where every creation tells a story. Soulful handcrafted treasures crafted with love, natural materials, and artisanal dedication by Rakhi.
            </p>

            <div className="social-links-row">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                title="Follow Rakhi on Instagram @srijan_handcraftedbyrakhi"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <button
                className="social-icon-btn"
                onClick={onOpenContact}
                title="Send Email: rakhikarn20001@gmail.com"
              >
                <Mail size={17} />
              </button>
              <button
                className="social-icon-btn"
                onClick={onOpenContact}
                title="Call: +91 9711881512"
              >
                <Phone size={17} />
              </button>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="footer-col-title">Creations</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => onNavigate('shop', 'Crochet')}>Crochet Botanicals</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Resin Art')}>Resin Keepsakes</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Name Plates')}>Artisanal Nameplates</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Ceramics & Mugs')}>Stoneware Mugs</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Plates & Bowls')}>Bowls & Plates</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')}>Curated Collections</button>
              </li>
            </ul>
          </div>

          {/* Support / Studio Column */}
          <div>
            <h4 className="footer-col-title">Studio & Care</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={onOpenContact}>Custom Commission Inquiries</button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')}>Our Craft Story</button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} style={{ color: '#C48B71', fontWeight: 600 }}>
                  Studio Admin Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')}>Care & Maintenance</button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')}>Packaging & Shipping</button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')}>Frequently Asked Questions</button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="newsletter-box">
            <h4 className="footer-col-title">Artisan Letters</h4>
            <p className="footer-desc" style={{ maxWidth: '100%' }}>
              Receive seasonal studio dispatches, behind-the-scenes craft stories, and first access to limited batch releases.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                <Send size={15} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.78rem', color: '#746D66' }}>
              <MapPin size={14} color="#C48B71" />
              <span>Studio based in India • Worldwide Express Shipping</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Srijan Handcrafted by Rakhi. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Artisan Sustainability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
