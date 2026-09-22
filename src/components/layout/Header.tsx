import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, ChevronDown, ShieldCheck, Truck, LogOut, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';

export type AppView = 'home' | 'shop' | 'about' | 'checkout' | 'admin' | 'tracking';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView, category?: string) => void;
  onOpenSearch: () => void;
  onOpenContact: () => void;
  onOpenAuth: () => void;
  onOpenCommission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenContact,
  onOpenAuth,
  onOpenCommission,
}) => {
  const { cartCount, wishlistCount, openCart } = useCart();
  const { currency, toggleCurrency } = useCurrency();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const categories = [
    'All Creations',
    'Crochet',
    'Resin Art',
    'Name Plates',
    'Ceramics & Mugs',
    'Plates & Bowls',
    'Home Decor',
  ];

  return (
    <>
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
                  Shop <ChevronDown size={13} />
                </button>

                {shopDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '-10px',
                      background: 'white',
                      borderRadius: '14px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                      border: '1px solid #EBE4DA',
                      padding: '10px',
                      minWidth: '210px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
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
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          color: '#2B2523',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
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
                  className="nav-link-btn"
                  onClick={onOpenCommission}
                  title="Request Bespoke Handcrafted Creation"
                >
                  Custom Orders
                </button>
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
                <button className="nav-link-btn" onClick={onOpenContact}>
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

            {/* User Account Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setUserDropdownOpen(true)}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <button
                className="icon-action-btn"
                onClick={isAuthenticated ? () => {} : onOpenAuth}
                title={isAuthenticated ? `Signed in as ${user?.name}` : 'Sign In / Register'}
                aria-label="Account"
                style={{
                  backgroundColor: isAuthenticated ? '#2B2523' : 'transparent',
                  color: isAuthenticated ? '#FBF9F5' : 'inherit',
                }}
              >
                <User size={18} strokeWidth={1.8} />
              </button>

              {userDropdownOpen && isAuthenticated && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #EBE4DA',
                    padding: '12px',
                    minWidth: '200px',
                    zIndex: 100,
                  }}
                >
                  <div style={{ paddingBottom: '8px', borderBottom: '1px solid #F0ECE6', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2B2523' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#746D66' }}>{user?.email}</div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#F4EFEA', color: '#C48B71', fontWeight: 600, display: 'inline-block', marginTop: '4px' }}>
                      {user?.role === 'ADMIN' ? 'Master Artisan' : 'Customer'}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#2B2523',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F4EFEA')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <ShieldCheck size={14} color="#C48B71" />
                      <span>Studio Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onNavigate('tracking'); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#2B2523',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F4EFEA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Truck size={14} />
                    <span>Track My Orders</span>
                  </button>

                  <button
                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#C0392B',
                      marginTop: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FDEDEC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
