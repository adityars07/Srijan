import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, Truck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const [query, setQuery] = useState(initialOrderNumber || 'SRJ-2026-1001');
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (searchNum: string) => {
    if (!searchNum.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.orders.track(searchNum.trim());
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your order number.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('SRJ-2026-1001');
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(query);
  };

  // Status mapping
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 1;
      case 'IN_CRAFTING': return 2;
      case 'DISPATCHED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return 0;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  const steps = [
    { title: 'Order Confirmed', desc: 'Received & verified at studio', icon: Package },
    { title: 'In Crafting', desc: "Hand-made by Rakhi in studio", icon: Clock },
    { title: 'Dispatched', desc: 'Securely packaged & handed to courier', icon: Truck },
    { title: 'Delivered', desc: 'Safely arrived at your doorstep', icon: CheckCircle2 },
  ];

  return (
    <div className="container" style={{ padding: '60px 0 100px', maxWidth: '880px' }}>
      <button
        onClick={onBackToShopping}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          fontSize: '0.88rem',
          color: '#746D66',
          cursor: 'pointer',
          marginBottom: '28px',
          padding: '0',
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Catalog</span>
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="section-eyebrow">Studio Dispatch & Logistics</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '12px' }}>
          Track Your Handcrafted Order
        </h1>
        <p style={{ color: '#746D66', fontSize: '0.96rem' }}>
          Follow the journey of your bespoke piece from Rakhi’s hands to your doorstep.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: '520px',
            margin: '24px auto 0',
            display: 'flex',
            gap: '8px',
            background: '#FBF9F5',
            padding: '6px',
            borderRadius: '9999px',
            border: '1px solid #EBE4DA',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. SRJ-2026-1001)"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px 18px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#2B2523',
              color: '#FBF9F5',
              padding: '10px 22px',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Search size={15} />
            <span>{isLoading ? 'Checking...' : 'Track'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#FDEDEC',
            color: '#C0392B',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div
          style={{
            backgroundColor: '#FAF7F2',
            borderRadius: '16px',
            border: '1px solid #EBE4DA',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          {/* Order Meta Bar */}
          <div
            style={{
              backgroundColor: '#2B2523',
              color: '#FBF9F5',
              padding: '24px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#C48B71', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Order Number
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600 }}>
                #{order.orderNumber}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#BDB3A6' }}>Courier Tracking No.</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#FAF3E0' }}>
                {order.trackingNumber || 'Awaiting dispatch assign'}
              </div>
            </div>
          </div>

          {/* Timeline Pipeline */}
          <div style={{ padding: '36px 30px 40px', borderBottom: '1px solid #EBE4DA' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', position: 'relative' }}>
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;
                const IconComponent = step.icon;

                return (
                  <div key={step.title} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? '#2B2523' : '#EBE4DA',
                        color: isCompleted ? '#FBF9F5' : '#8C827A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        transition: 'all 0.3s ease',
                        border: isCurrent ? '3px solid #C48B71' : 'none',
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isCompleted ? '#2B2523' : '#8C827A', marginBottom: '4px' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#746D66', lineHeight: 1.3 }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Summary */}
          <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
            {/* Items */}
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px', color: '#2B2523' }}>
                Handcrafted Items ({order.items.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px',
                      backgroundColor: '#FDFBF7',
                      borderRadius: '10px',
                      border: '1px solid #EBE4DA',
                    }}
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2B2523', marginBottom: '2px' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#746D66' }}>
                        {item.colorName && `Color: ${item.colorName} • `}Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#2B2523' }}>
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment summary */}
            <div style={{ backgroundColor: '#F4EFEA', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', color: '#2B2523' }}>
                Delivery Details
              </h4>
              <div style={{ fontSize: '0.84rem', color: '#746D66', lineHeight: 1.6, marginBottom: '18px' }}>
                <strong style={{ color: '#2B2523', display: 'block' }}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </strong>
                {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
                <div style={{ marginTop: '4px' }}>Phone: {order.shippingAddress.phone || order.guestPhone}</div>
              </div>

              <div style={{ borderTop: '1px solid #E5DDD3', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#746D66' }}>Payment Method:</span>
                <strong style={{ color: '#2B2523', textTransform: 'uppercase' }}>{order.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginTop: '6px' }}>
                <span style={{ color: '#746D66' }}>Payment Status:</span>
                <span style={{ color: order.paymentStatus === 'PAID' ? '#2E7D32' : '#C87D55', fontWeight: 600 }}>
                  {order.paymentStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, marginTop: '14px', borderTop: '1px solid #E5DDD3', paddingTop: '12px', color: '#2B2523' }}>
                <span>Total Amount:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
