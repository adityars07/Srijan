import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building2, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';

interface CheckoutViewProps {
  onOrderSuccess: () => void;
  onNavigateHome: () => void;
  onNavigateTracking?: (orderNumber: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onNavigateHome,
  onNavigateTracking,
}) => {
  const {
    cart,
    promoCode,
    discountPercentage,
    applyPromoCode,
    clearCart,
    showToast,
  } = useCart();

  const { currency, formatPrice } = useCurrency();

  // Form states
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'bank'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Subtotal calculations
  const subtotalRaw = cart.reduce((sum, item) => {
    const price = currency === 'INR' ? item.product.priceINR : item.product.priceUSD;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = Math.round((subtotalRaw * discountPercentage) / 100);

  const shippingCost =
    shippingMethod === 'pickup'
      ? 0
      : shippingMethod === 'express'
      ? currency === 'INR' ? 250 : 20
      : currency === 'INR' ? 120 : 10;

  const totalAmount = Math.max(0, subtotalRaw - discountAmount + shippingCost);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      try {
        const res = await api.coupons.validate(couponCode.trim(), subtotalRaw);
        applyPromoCode(couponCode.trim());
        showToast(`Promo code ${res.coupon.code} applied successfully!`);
        setCouponCode('');
      } catch (err: any) {
        showToast(err.message || 'Invalid promo code', 'info');
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images?.[0] || '/images/crochet-artisan-floral-bouquet.jpg',
          colorName: item.selectedColor?.name || null,
          sizeName: item.selectedSize || 'Standard',
          unitPrice: currency === 'INR' ? item.product.priceINR : item.product.priceUSD,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName,
          lastName,
          street: address,
          apartment,
          city,
          postalCode,
          country,
          phone,
          email,
        },
        currency,
        shippingMethod,
        paymentMethod: paymentMethod.toUpperCase(),
        couponCode: promoCode || null,
        guestInfo: { name: `${firstName} ${lastName}`.trim(), email, phone },
      };

      const res = await api.orders.create(orderPayload);
      setCreatedOrder(res.order);
      setOrderComplete(true);
      clearCart();
      showToast(`Order #${res.order.orderNumber} confirmed & saved in studio database!`);
      onOrderSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete && createdOrder) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', maxWidth: '640px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <CheckCircle2 size={46} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '12px' }}>
          Thank You, {firstName}!
        </h2>
        <p style={{ color: '#746D66', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Your order has been recorded in Rakhi’s studio crafting ledger. A receipt with tracking updates has been dispatched to <strong>{email}</strong>.
        </p>

        <div style={{ background: '#FAF7F2', padding: '24px', borderRadius: '16px', marginBottom: '32px', textAlign: 'left', border: '1px solid #EBE4DA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #EBE4DA', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.86rem', color: '#746D66' }}>Order Reference:</span>
            <strong style={{ fontSize: '1.05rem', color: '#2B2523', fontFamily: 'var(--font-serif)' }}>#{createdOrder.orderNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#746D66' }}>Courier Tracking:</span>
            <strong style={{ fontSize: '0.88rem', color: '#C48B71', fontFamily: 'monospace' }}>{createdOrder.trackingNumber || 'Pending Dispatch'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#746D66' }}>Payment Method:</span>
            <strong style={{ fontSize: '0.88rem', color: '#2B2523', textTransform: 'uppercase' }}>{createdOrder.paymentMethod}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#746D66' }}>Delivery Address:</span>
            <span style={{ fontSize: '0.85rem', color: '#2B2523', textAlign: 'right' }}>{address}, {city}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {onNavigateTracking && (
            <button
              className="see-all-link"
              onClick={() => onNavigateTracking(createdOrder.orderNumber)}
              style={{ backgroundColor: '#2B2523', color: '#FBF9F5', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Truck size={16} />
              <span>Track Live Crafting Status</span>
            </button>
          )}

          <button
            onClick={onNavigateHome}
            style={{
              padding: '12px 24px',
              borderRadius: '9999px',
              border: '1px solid #EBE4DA',
              backgroundColor: '#F4EFEA',
              color: '#2B2523',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Return to Studio Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrap">
      <div className="container">
        {/* Breadcrumb path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#746D66', marginBottom: '32px' }}>
          <button onClick={onNavigateHome} style={{ color: '#746D66' }}>Home</button>
          <ChevronRight size={14} />
          <span>Cart</span>
          <ChevronRight size={14} />
          <span style={{ color: '#2B2523', fontWeight: 600 }}>Checkout & Delivery</span>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-grid">
            {/* Left Column: Form Details */}
            <div>
              {/* Contact Information */}
              <div className="checkout-section-block">
                <div className="checkout-block-heading">
                  <span>Contact Information</span>
                  <span style={{ fontSize: '0.82rem', color: '#746D66', fontWeight: 400 }}>
                    Already have an account? <strong style={{ color: '#C48B71', cursor: 'pointer' }}>Log in</strong>
                  </span>
                </div>

                <div className="form-field">
                  <label>Email address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="checkout-section-block">
                <h4 className="checkout-block-heading">Shipping Address</h4>

                <div className="form-field">
                  <label>Country / Region *</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>First name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Last name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number and street name"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Apartment, suite, unit (optional)</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Postal code / PIN *</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone number (for delivery SMS) *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Methods (Exact Terra Style) */}
              <div className="checkout-section-block">
                <h4 className="checkout-block-heading">Shipping Method</h4>

                <div className="radio-selection-group">
                  <label
                    className={`radio-selection-card ${shippingMethod === 'express' ? 'active' : ''}`}
                    onClick={() => setShippingMethod('express')}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title">Insured Express Courier with Fragile Handling</div>
                        <div className="radio-card-desc">Delivered in 2-3 working days • Reinforced Honeycomb Crate</div>
                      </div>
                      <span className="radio-card-price">
                        {currency === 'INR' ? '₹250' : '$20 USD'}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`radio-selection-card ${shippingMethod === 'standard' ? 'active' : ''}`}
                    onClick={() => setShippingMethod('standard')}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title">Standard Ground Delivery</div>
                        <div className="radio-card-desc">Delivered in 5-7 working days</div>
                      </div>
                      <span className="radio-card-price">
                        {currency === 'INR' ? '₹120' : '$10 USD'}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`radio-selection-card ${shippingMethod === 'pickup' ? 'active' : ''}`}
                    onClick={() => setShippingMethod('pickup')}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'pickup'}
                      onChange={() => setShippingMethod('pickup')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title">Direct Studio Pickup</div>
                        <div className="radio-card-desc">Pick up personally from Srijan Studio in India</div>
                      </div>
                      <span className="radio-card-price" style={{ color: '#2E7D32' }}>
                        Free
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Methods (Exact Terra Style) */}
              <div className="checkout-section-block">
                <h4 className="checkout-block-heading">Payment Method</h4>

                <div className="radio-selection-group">
                  {/* UPI / NetBanking / GPay (India friendly) */}
                  <label
                    className={`radio-selection-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Smartphone size={16} />
                          <span>Instant UPI / QR Code / NetBanking</span>
                        </div>
                        <div className="radio-card-desc">Google Pay, PhonePe, Paytm, BHIM, or all Indian banks</div>
                      </div>
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label
                    className={`radio-selection-card ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={16} />
                          <span>Credit / Debit Card</span>
                        </div>
                        <div className="radio-card-desc">Visa, MasterCard, RuPay, American Express</div>
                      </div>
                    </div>
                  </label>

                  {/* Bank Deposit */}
                  <label
                    className={`radio-selection-card ${paymentMethod === 'bank' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="radio-indicator"
                    />
                    <div className="radio-card-content">
                      <div>
                        <div className="radio-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} />
                          <span>Direct Bank Wire / NEFT</span>
                        </div>
                        <div className="radio-card-desc">Manual bank transfer with transaction receipt confirmation</div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Credit card inputs if card selected */}
                {paymentMethod === 'card' && (
                  <div style={{ background: '#F4EFEA', padding: '18px', borderRadius: '12px', marginTop: '14px' }}>
                    <div className="form-field">
                      <label>Card Number</label>
                      <input type="text" placeholder="4532 •••• •••• 8910" defaultValue="4532 9821 0042 8910" />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Expiration (MM/YY)</label>
                        <input type="text" placeholder="12/28" defaultValue="08/27" />
                      </div>
                      <div className="form-field">
                        <label>CVV / CVC</label>
                        <input type="text" placeholder="123" defaultValue="782" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="checkout-action-btn"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Securing Order...' : `Complete Order • ${formatPrice(totalAmount, totalAmount)}`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: '#746D66', marginTop: '14px' }}>
                <ShieldCheck size={16} color="#2E7D32" />
                <span>256-bit Encrypted Checkout • Artisan Quality Guarantee</span>
              </div>
            </div>

            {/* Right Column: Order Summary Card (Exact Terra Style) */}
            <div>
              <div className="checkout-summary-card">
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px' }}>
                  Order Summary ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </h4>

                {/* Items list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {cart.map((item) => {
                    const price = currency === 'INR' ? item.product.priceINR : item.product.priceUSD;
                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: '#2B2523',
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.quantity}
                          </span>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.25 }}>{item.product.name}</div>
                          <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '2px' }}>
                            {item.selectedColor.name} • {item.selectedSize}
                          </div>
                        </div>

                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {formatPrice(price * item.quantity, price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Box */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Discount code or gift card"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '9999px', fontSize: '0.84rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="promo-apply-btn"
                    >
                      Apply
                    </button>
                  </div>

                  {promoCode && (
                    <div style={{ fontSize: '0.78rem', color: '#2E7D32', marginTop: '6px' }}>
                      Active: <strong>{promoCode}</strong> ({discountPercentage}% OFF)
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #EBE4DA', paddingTop: '16px' }}>
                  <div className="cart-summary-line">
                    <span>Items Total</span>
                    <span>{formatPrice(subtotalRaw, subtotalRaw)}</span>
                  </div>

                  <div className="cart-summary-line">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost, shippingCost)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="cart-summary-line" style={{ color: '#2E7D32' }}>
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount, discountAmount)}</span>
                    </div>
                  )}

                  <div className="cart-summary-total">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount, totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
