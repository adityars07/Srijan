import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, ChevronDown, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface HeaderProps {
  currentView: 'home' | 'shop' | 'about' | 'checkout';
  onNavigate: (view: 'home' | 'shop' | 'about' | 'checkout', category?: string) => void;
  onOpenSearch: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenContact,
}) => {
  const { cartCount, wishlistCount, openCart } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

  const categories = [
    'All Creations',
    'Crochet & Blooms',
    'Resin Keepsakes',
    'Artisanal Nameplates',
    'Ceramics & Tableware',
    'Home Accents',
  ];

  return (
    <>
      {/* Top promotional bar */}
      <div className="top-announcement">
        <span>Bespoke Handmade Art & Keepsakes</span>
        <span className="highlight">• Free Shipping on orders over ₹3,000 / $50 USD •</span>
        <span>Handcrafted in India by Rakhi</span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          {/* Brand Logo with Organic Glyph */}
          <div className="brand-logo" onClick={() => onNavigate('home')}>
            <div className="brand-icon-glyph" title="Srijan Sacred Craft Symbol">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 6 C12 11 12 21 16 26" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 6 C20 11 20 21 16 26" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6 16 C11 12 21 12 26 16" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6 16 C11 20 21 20 26 16" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <div className="brand-title-group">
              <span className="brand-name">Srijan</span>
              <span className="brand-tagline">Handcrafted by Rakhi</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <button
                  className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => onNavigate('home')}
                >
                  Home
                </button>
              </li>

              {/* Shop with Dropdown */}
              <li
                style={{ position: 'relative' }}
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button
                  className={`nav-link-btn ${currentView === 'shop' ? 'active' : ''}`}
                  onClick={() => onNavigate('shop')}
                >
                  Shop <ChevronDown size={14} />
                </button>

                {shopDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '-10px',
                      background: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                      border: '1px solid #EBE4DA',
                      padding: '12px',
                      minWidth: '220px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onNavigate('shop', cat === 'All Creations' ? undefined : cat);
                          setShopDropdownOpen(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          color: '#2B2523',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F4EFEA')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </li>

              <li>
                <button
                  className={`nav-link-btn ${currentView === 'about' ? 'active' : ''}`}
                  onClick={() => onNavigate('about')}
                >
                  About Us
                </button>
              </li>

              <li>
                <button
                  className="nav-link-btn"
                  onClick={onOpenContact}
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Action Icons & Currency Switcher */}
          <div className="header-actions">
            {/* Currency Switcher */}
            <button
              className="currency-toggle-btn"
              onClick={toggleCurrency}
              title="Click to toggle currency"
            >
              <Sparkles size={13} color="#C48B71" />
              <span>{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
            </button>

            {/* Search */}
            <button
              className="icon-action-btn"
              onClick={onOpenSearch}
              title="Search creations, collections & stories"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            {/* Wishlist */}
            <button
              className="icon-action-btn"
              onClick={() => onNavigate('shop')}
              title={`Wishlist (${wishlistCount} saved)`}
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.8} />
              {wishlistCount > 0 && <span className="badge-counter">{wishlistCount}</span>}
            </button>

            {/* Cart Drawer Toggle */}
            <button
              className="icon-action-btn"
              onClick={openCart}
              title="View Cart"
              aria-label="Cart"
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              {cartCount > 0 && <span className="badge-counter">{cartCount}</span>}
            </button>

            {/* User Account / Contact */}
            <button
              className="icon-action-btn"
              onClick={onOpenContact}
              title="Contact / Account"
              aria-label="Account"
            >
              <User size={19} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
