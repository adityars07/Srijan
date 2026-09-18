import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreMore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreMore,
}) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    promoCode,
    discountPercentage,
    promoError,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const { currency, formatPrice } = useCurrency();
  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  // Free shipping threshold: ₹3,000 or $50 USD
  const freeShippingThreshold = currency === 'INR' ? 3000 : 50;

  // Calculate subtotal
  const subtotalRaw = cart.reduce((sum, item) => {
    const itemPrice = currency === 'INR' ? item.product.priceINR : item.product.priceUSD;
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round((subtotalRaw * discountPercentage) / 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalRaw);
  const progressPercent = Math.min(100, Math.round((subtotalRaw / freeShippingThreshold) * 100));

  const shippingCost = subtotalRaw >= freeShippingThreshold || subtotalRaw === 0 ? 0 : currency === 'INR' ? 250 : 15;
  const grandTotal = Math.max(0, subtotalRaw - discountAmount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyPromoCode(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeCart}>
      <aside className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div>
            <h3 className="cart-drawer-title">Shopping Cart</h3>
            <span style={{ fontSize: '0.8rem', color: '#746D66' }}>
              {cart.length} item{cart.length !== 1 ? 's' : ''} in your bag
            </span>
          </div>
          <button className="icon-action-btn" onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="shipping-tracker-box">
          <div className="shipping-tracker-text">
            {remainingForFreeShipping > 0 ? (
              <span>
                Spend <strong>{currency === 'INR' ? `₹${remainingForFreeShipping}` : `$${remainingForFreeShipping} USD`}</strong> more to get free express shipping!
              </span>
            ) : (
              <span style={{ color: '#2E7D32', fontWeight: 600 }}>
                🎉 You've unlocked Free Express Shipping!
              </span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="cart-drawer-items">
          {cart.length > 0 ? (
            cart.map((item) => {
              const itemPrice = currency === 'INR' ? item.product.priceINR : item.product.priceUSD;
              return (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="cart-item-img"
                  />

                  <div className="cart-item-details">
                    <div className="cart-item-title-row">
                      <div>
                        <h5 className="cart-item-title">{item.product.name}</h5>
                        <div className="cart-item-variant">
                          <span>{item.selectedColor.name}</span>
                          {item.selectedSize && <span> • {item.selectedSize}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: '#9E968E', padding: '2px' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cart-item-actions-row">
                      <div className="qty-stepper">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={13} />
                        </button>
                      </div>

                      <span style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                        {formatPrice(itemPrice * item.quantity, itemPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#746D66' }}>
              <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.86rem', marginBottom: '20px' }}>
                Explore Rakhi’s handcrafted creations to fill your space with warmth.
              </p>
              <button
                className="see-all-link"
                onClick={() => {
                  closeCart();
                  onExploreMore();
                }}
              >
                <span>Browse Creations</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo Code Input */}
            <div>
              <form onSubmit={handleApplyCoupon} className="promo-input-row">
                <input
                  type="text"
                  placeholder="Promo code (e.g. SRIJAN10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="promo-apply-btn">
                  Apply
                </button>
              </form>

              {promoCode && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#2E7D32', marginTop: '6px' }}>
                  <span>Code <strong>{promoCode}</strong> applied ({discountPercentage}% OFF)</span>
                  <button onClick={removePromoCode} style={{ color: '#D94343', textDecoration: 'underline' }}>
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <span style={{ fontSize: '0.75rem', color: '#D94343', display: 'block', marginTop: '4px' }}>
                  {promoError}
                </span>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalRaw, subtotalRaw)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="cart-summary-line" style={{ color: '#2E7D32' }}>
                  <span>Artisan Discount ({discountPercentage}%)</span>
                  <span>-{formatPrice(discountAmount, discountAmount)}</span>
                </div>
              )}

              <div className="cart-summary-line">
                <span>Estimated Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost, shippingCost)}</span>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(grandTotal, grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              className="checkout-action-btn"
              onClick={() => {
                closeCart();
                onProceedToCheckout();
              }}
            >
              Checkout • {formatPrice(grandTotal, grandTotal)}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
