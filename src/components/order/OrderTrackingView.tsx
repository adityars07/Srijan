import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  onBackToShopping: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  onBackToShopping,
}) => {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState(initialOrderNumber || 'SRJ-2026-3878');
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCourier, setCopiedCourier] = useState(false);

  const fetchOrder = async (searchNum: string) => {
    if (!searchNum.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.orders.track(searchNum.trim());
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify your order number.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('SRJ-2026-3878');
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const copyToClipboard = (text: string, type: 'id' | 'courier') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedCourier(true);
      setTimeout(() => setCopiedCourier(false), 2000);
    }
  };

  // Safe parsing of address
  const shippingAddress = useMemo(() => {
    if (!order?.shippingAddress) return null;
    if (typeof order.shippingAddress === 'object') return order.shippingAddress;
    try {
      return JSON.parse(order.shippingAddress);
    } catch {
      return null;
    }
  }, [order?.shippingAddress]);

  // Status mapping to steps 1..4
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PENDING_PAYMENT':
        return 1;
      case 'IN_CRAFTING':
        return 2;
      case 'DISPATCHED':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  // Track progress fill width calculation: 0%, 33%, 66%, 100%
  const trackFillPercent = Math.max(0, Math.min(100, ((currentStep - 1) / 3) * 100));

  const steps = [
    { title: 'Order Confirmed', desc: 'Received & verified at studio', icon: Package },
    { title: 'In Crafting', desc: 'Hand-made by Rakhi in studio', icon: Clock },
    { title: 'Dispatched', desc: 'Securely packaged & with courier', icon: Truck },
    { title: 'Delivered', desc: 'Safely arrived at your doorstep', icon: CheckCircle2 },
  ];

  // Helper to resolve fallback product images if null or broken
  const resolveItemImage = (item: any) => {
    if (item.productImage && item.productImage.trim() !== '') return item.productImage;
    const n = (item.productName || '').toLowerCase();
    if (n.includes('sling') || n.includes('bag')) return '/images/crochet-sunflower-tote-crossbody.jpg';
    if (n.includes('dream') || n.includes('catcher')) return '/images/crochet-mandala-dreamcatcher-emerald.jpg';
    if (n.includes('flower') || n.includes('rose') || n.includes('bouquet')) return '/images/crochet-artisan-floral-bouquet.jpg';
    if (n.includes('keychain')) return '/images/crochet-daisy-keychains-pair.jpg';
    if (n.includes('plate') || n.includes('name')) return '/images/buddha_nameplate.jpg';
    if (n.includes('mug') || n.includes('cup')) return '/images/stoneware_mug.jpg';
    if (n.includes('bowl')) return '/images/ceramic_plates.jpg';
    return '/images/crochet-artisan-floral-bouquet.jpg';
  };

  const recipientName =
    shippingAddress?.firstName || shippingAddress?.lastName
      ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim()
      : order?.guestName || 'Studio Patron';

  const recipientPhone = shippingAddress?.phone || order?.guestPhone || '';
  const recipientEmail = shippingAddress?.email || order?.guestEmail || '';

  const addressLines = [
    shippingAddress?.apartment,
    shippingAddress?.street,
    [shippingAddress?.city, shippingAddress?.postalCode].filter(Boolean).join(', '),
    shippingAddress?.country || 'India',
  ].filter(Boolean);

  return (
    <div className="container" style={{ padding: '40px 0 90px', maxWidth: '920px' }}>
      {/* Return to shop */}
      <button
        onClick={onBackToShopping}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          fontSize: '0.88rem',
          color: '#746D66',
          cursor: 'pointer',
          marginBottom: '24px',
          padding: '4px 0',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Catalog</span>
      </button>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="section-eyebrow">Studio Dispatch & Logistics</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '10px', color: '#2B2523' }}>
          Track Your Handcrafted Order
        </h1>
        <p style={{ color: '#746D66', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>
          Follow the journey of your bespoke piece from Rakhi’s hands to your doorstep.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: '520px',
            margin: '22px auto 0',
            display: 'flex',
            gap: '8px',
            background: '#FFFFFF',
            padding: '6px',
            borderRadius: '9999px',
            border: '1px solid #EBE4DA',
            boxShadow: '0 4px 16px rgba(43, 37, 35, 0.04)',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. SRJ-2026-3878)"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px 18px',
              fontSize: '0.92rem',
              outline: 'none',
              color: '#2B2523',
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#2B2523',
              color: '#FAF7F2',
              padding: '10px 24px',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <Search size={15} />
            <span>{isLoading ? 'Checking...' : 'Track'}</span>
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: '#FDEDEC',
            color: '#C0392B',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #FADBD8',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Order Card */}
      {order && (
        <div className="tracking-card">
          {/* Top Banner */}
          <div className="tracking-header-bar">
            <div className="tracking-header-left">
              <span className="tracking-header-label">Order Number</span>
              <div className="tracking-order-num-row">
                <span className="tracking-order-num">#{order.orderNumber}</span>
                <button
                  type="button"
                  className="tracking-copy-btn"
                  onClick={() => copyToClipboard(order.orderNumber, 'id')}
                  title="Copy Order ID"
                >
                  {copiedId ? <Check size={13} color="#81C784" /> : <Copy size={13} />}
                  <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                </button>

                {/* Status chip */}
                <span
                  className={`tracking-status-chip ${
                    order.status === 'DELIVERED'
                      ? 'delivered'
                      : order.status === 'DISPATCHED'
                      ? 'dispatched'
                      : order.status === 'IN_CRAFTING'
                      ? 'crafting'
                      : 'confirmed'
                  }`}
                >
                  {order.status === 'DELIVERED' && <CheckCircle2 size={12} />}
                  {order.status === 'DISPATCHED' && <Truck size={12} />}
                  {order.status === 'IN_CRAFTING' && <Clock size={12} />}
                  {order.status === 'CONFIRMED' && <Package size={12} />}
                  {order.status}
                </span>
              </div>
            </div>

            {/* Courier Tracking Info */}
            <div className="tracking-courier-box">
              <div className="tracking-courier-label">Courier Logistics Partner</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="tracking-courier-num">
                  {order.trackingNumber || 'Assigning Courier...'}
                </span>
                {order.trackingNumber && (
                  <button
                    type="button"
                    className="tracking-copy-btn"
                    onClick={() => copyToClipboard(order.trackingNumber, 'courier')}
                    title="Copy Tracking Number"
                  >
                    {copiedCourier ? <Check size={12} color="#81C784" /> : <Copy size={12} />}
                    <span>{copiedCourier ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="tracking-stepper-container">
            {/* Desktop Stepper */}
            <div className="tracking-stepper-desktop">
              <div className="tracking-track-bg" />
              <div className="tracking-track-fill" style={{ width: `${trackFillPercent}%` }} />

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const IconComponent = step.icon;

                return (
                  <div
                    key={step.title}
                    className={`tracking-step-node ${
                      isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
                    }`}
                  >
                    <div className="tracking-node-icon">
                      {isCompleted ? <Check size={20} strokeWidth={2.5} /> : <IconComponent size={20} />}
                    </div>
                    <div className="tracking-node-title">{step.title}</div>
                    <div className="tracking-node-desc">{step.desc}</div>
                    {isCurrent && (
                      <span className="tracking-active-badge">Current Status</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="tracking-stepper-mobile">
              <div className="tracking-vertical-line" />
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                const IconComponent = step.icon;

                return (
                  <div key={step.title} className="tracking-mobile-step">
                    <div
                      className={`tracking-node-icon`}
                      style={{
                        backgroundColor: isCurrent ? '#C48B71' : isCompleted ? '#2B2523' : '#FAF7F2',
                        color: isCurrent || isCompleted ? '#FAF7F2' : '#A89E94',
                        border: !isCompleted && !isCurrent ? '2px solid #DED4C7' : 'none',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(196,139,113,0.22)' : 'none',
                      }}
                    >
                      {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <IconComponent size={18} />}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          color: isCurrent || isCompleted ? '#2B2523' : '#9C948B',
                        }}
                      >
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#746D66', marginTop: '2px' }}>
                        {step.desc}
                      </div>
                      {isCurrent && <span className="tracking-active-badge">Current Status</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Summary Grid */}
          <div className="tracking-details-grid">
            {/* Left: Handcrafted Items */}
            <div>
              <h3
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '18px',
                  color: '#2B2523',
                }}
              >
                Handcrafted Items ({order.items?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items?.map((item: any) => {
                  const displayImg = resolveItemImage(item);
                  return (
                    <div key={item.id} className="tracking-items-card">
                      <img
                        src={displayImg}
                        alt={item.productName}
                        className="tracking-item-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/crochet-artisan-floral-bouquet.jpg';
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            color: '#2B2523',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.productName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#746D66' }}>
                          {item.colorName && <span>Color: {item.colorName} • </span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.96rem', color: '#2B2523', whiteSpace: 'nowrap' }}>
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Delivery & Payment Details */}
            <div className="tracking-delivery-box">
              {/* Recipient Details */}
              <div>
                <h4
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '12px',
                    color: '#2B2523',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MapPin size={15} color="#C48B71" />
                  <span>Delivery Address</span>
                </h4>

                <div style={{ fontSize: '0.86rem', color: '#5A534E', lineHeight: 1.55 }}>
                  <div style={{ fontWeight: 600, color: '#2B2523', fontSize: '0.92rem', marginBottom: '4px' }}>
                    {recipientName}
                  </div>
                  {addressLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                  {recipientPhone && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#746D66' }}>
                      <Phone size={13} />
                      <span>{recipientPhone}</span>
                    </div>
                  )}
                  {recipientEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#746D66', marginTop: '2px' }}>
                      <Mail size={13} />
                      <span>{recipientEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ borderTop: '1px solid #E5DDD3', paddingTop: '14px' }}>
                <h4
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                    color: '#2B2523',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={15} color="#2E7D32" />
                  <span>Payment Summary</span>
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#746D66' }}>Payment Method:</span>
                  <strong style={{ color: '#2B2523' }}>{order.paymentMethod || 'RAZORPAY'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: '#746D66' }}>Payment Status:</span>
                  <span
                    style={{
                      color: order.paymentStatus === 'PAID' ? '#2E7D32' : '#C87D55',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {order.paymentStatus === 'PAID' && <CheckCircle2 size={13} />}
                    {order.paymentStatus}
                  </span>
                </div>

                {order.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                    <span style={{ color: '#746D66' }}>Razorpay Ref:</span>
                    <code style={{ fontSize: '0.78rem', color: '#5A534E', background: '#EAE3D9', padding: '2px 6px', borderRadius: '4px' }}>
                      {order.razorpayPaymentId}
                    </code>
                  </div>
                )}

                <div style={{ borderTop: '1px dashed #DDD5C9', margin: '10px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#746D66', marginBottom: '4px' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#746D66', marginBottom: '4px' }}>
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#2E7D32', marginBottom: '4px' }}>
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    marginTop: '10px',
                    borderTop: '1px solid #E5DDD3',
                    paddingTop: '10px',
                    color: '#2B2523',
                  }}
                >
                  <span>Total Amount:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Support / Contact link */}
              <div style={{ borderTop: '1px solid #E5DDD3', paddingTop: '12px' }}>
                <a
                  href={`https://wa.me/919711881512?text=Hello%20Rakhi,%20I%20have%20an%20inquiry%20regarding%20my%20Order%20%23${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0D7CC',
                    color: '#2B2523',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MessageCircle size={15} color="#25D366" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
