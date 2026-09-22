import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  HeartHandshake,
  Mail,
  Plus,
  Edit2,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

interface AdminDashboardViewProps {
  onBackToStore: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToStore }) => {
  const { user, isAdmin, login } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useCart();

  const [adminEmail, setAdminEmail] = useState('admin@srijan.com');
  const [adminPassword, setAdminPassword] = useState('ArtisanRakhi2026!');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await login(customEmail || adminEmail, customPass || adminPassword);
      showToast('Welcome to Srijan Studio Admin Dashboard!');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'products' | 'commissions' | 'messages'>('metrics');
  const [metrics, setMetrics] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New product form modal state
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Crochet');
  const [newProdPriceINR, setNewProdPriceINR] = useState('1500');
  const [newProdPriceUSD, setNewProdPriceUSD] = useState('20');
  const [newProdSku, setNewProdSku] = useState('SRJ-CR-NEW');
  const [newProdMaterial, setNewProdMaterial] = useState('Milk Cotton Yarn');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('/images/crochet-artisan-floral-bouquet.jpg');
  const [newProdStock, setNewProdStock] = useState('20');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Edit stock/price modal
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPriceINR, setEditPriceINR] = useState('');
  const [editStock, setEditStock] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, ordersRes, productsRes, commissionsRes, messagesRes] = await Promise.all([
        api.admin.getMetrics().catch(() => ({ metrics: null, recentOrders: [], recentRequests: [] })),
        api.orders.getAll().catch(() => ({ orders: [] })),
        api.products.getAll({ sortBy: 'newest' }).catch(() => ({ products: [] })),
        api.customRequests.getAll().catch(() => ({ requests: [] })),
        api.contact.getAll().catch(() => ({ messages: [] })),
      ]);

      setMetrics(metricsRes.metrics);
      setOrders(ordersRes.orders || []);
      setProducts(productsRes.products || []);
      setCommissions(commissionsRes.requests || []);
      setMessages(messagesRes.messages || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    try {
      await api.products.create({
        name: newProdName,
        category: newProdCategory,
        priceINR: parseFloat(newProdPriceINR),
        priceUSD: parseFloat(newProdPriceUSD),
        sku: newProdSku,
        material: newProdMaterial,
        description: newProdDescription,
        stockQuantity: parseInt(newProdStock, 10),
        images: [newProdImageUrl],
        colors: [{ name: 'Default Studio Color', hex: '#C48B71' }],
        sizes: ['Standard'],
      });
      showToast('New handcrafted product added to live catalog!');
      setIsNewProductModalOpen(false);
      setNewProdName('');
      setNewProdDescription('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    try {
      await api.products.update(editingProduct.id, {
        priceINR: parseFloat(editPriceINR),
        stockQuantity: parseInt(editStock, 10),
      });
      showToast('Product updated successfully!');
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product');
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await api.contact.markRead(id);
      showToast('Message marked as read');
      loadData();
    } catch {
      // ignore
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 20px 100px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 20px 40px rgba(43, 37, 35, 0.08)',
            border: '1px solid #EBE5DC',
            textAlign: 'center',
          }}
        >
          {/* Badge Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#F7EBE1',
              color: '#C48B71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 16px rgba(196, 139, 113, 0.2)',
            }}
          >
            <ShieldCheck size={34} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.9rem',
              color: '#2B2523',
              marginBottom: '10px',
              fontWeight: 600,
            }}
          >
            Studio Admin Portal
          </h2>

          <p style={{ color: '#746D66', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '28px' }}>
            Enter Master Artisan credentials to manage your product catalog, real-time inventory, bespoke commissions, and orders.
          </p>

          {/* Quick 1-Click Login Button */}
          <button
            type="button"
            onClick={() => handleAdminLogin(undefined, 'admin@srijan.com', 'ArtisanRakhi2026!')}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#C48B71',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(196, 139, 113, 0.35)',
              transition: 'all 0.2s ease',
              marginBottom: '22px',
            }}
          >
            <Sparkles size={18} />
            <span>{isLoggingIn ? 'Authenticating...' : '⚡ 1-Click Master Artisan Login'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '18px 0',
              color: '#A0978E',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EBE5DC' }} />
            <span>or sign in manually</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EBE5DC' }} />
          </div>

          {loginError && (
            <div
              style={{
                backgroundColor: '#FDF2F2',
                color: '#9B1C1C',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '18px',
                textAlign: 'left',
                border: '1px solid #F8B4B4',
              }}
            >
              {loginError}
            </div>
          )}

          {/* Manual Form */}
          <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="admin-email"
                style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3E39', marginBottom: '6px' }}
              >
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D5CCC1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="admin-password"
                style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3E39', marginBottom: '6px' }}
              >
                Studio Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D5CCC1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                backgroundColor: '#2B2523',
                color: '#FBF9F5',
                border: 'none',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                marginBottom: '14px',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In to Studio'}
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToStore}
            style={{
              background: 'none',
              border: 'none',
              color: '#746D66',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '8px',
            }}
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0 100px', maxWidth: '1180px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToStore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F4EFEA',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#2B2523',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Storefront</span>
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>
              Rakhi’s Studio Management
            </h1>
            <span style={{ fontSize: '0.82rem', color: '#746D66' }}>
              Connected to Live Database (SQLite / Prisma) • Logged in as <strong>{user?.name}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F4EFEA',
            border: '1px solid #EBE4DA',
            borderRadius: '9999px',
            padding: '8px 16px',
            fontSize: '0.84rem',
            cursor: 'pointer',
            color: '#2B2523',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C48B71', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gross Sales</span>
              <DollarSign size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {formatPrice(metrics.totalRevenueINR)}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              ${metrics.totalRevenueUSD} USD total revenue
            </div>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2B2523', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
              <Package size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {metrics.totalOrders}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              {metrics.orderStatusCounts.IN_CRAFTING || 0} in active crafting
            </div>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B86F52', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bespoke Inquiries</span>
              <HeartHandshake size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {metrics.pendingCustomRequests}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              Awaiting quote or crafting
            </div>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C0392B', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inventory Alert</span>
              <AlertTriangle size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {metrics.lowStockCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              Handmade items under 15 units
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #EBE4DA', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'metrics', label: 'Overview & Recent', icon: TrendingUp },
          { key: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { key: 'products', label: `Product Catalog (${products.length})`, icon: Edit2 },
          { key: 'commissions', label: `Bespoke Inquiries (${commissions.length})`, icon: HeartHandshake },
          { key: 'messages', label: `Messages (${messages.length})`, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: isActive ? '#2B2523' : 'transparent',
                color: isActive ? '#FBF9F5' : '#746D66',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Recent Orders Card */}
          <div style={{ background: '#FAF7F2', padding: '24px', borderRadius: '14px', border: '1px solid #EBE4DA' }}>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: '#2B2523' }}>
              Recent Orders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FDFBF7', borderRadius: '8px', border: '1px solid #EBE4DA' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#2B2523' }}>#{o.orderNumber}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#746D66' }}>
                      {o.guestName || 'Customer'} • {o.items?.length || 1} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#2B2523' }}>
                      {formatPrice(o.totalAmount)}
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '9999px', background: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bespoke Requests */}
          <div style={{ background: '#FAF7F2', padding: '24px', borderRadius: '14px', border: '1px solid #EBE4DA' }}>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', marginBottom: '16px', color: '#2B2523' }}>
              Bespoke Commission Inquiries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {commissions.slice(0, 5).map((c) => (
                <div key={c.id} style={{ padding: '12px', background: '#FDFBF7', borderRadius: '8px', border: '1px solid #EBE4DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#2B2523' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.74rem', color: '#C48B71', fontWeight: 600 }}>{c.category}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#746D66', marginBottom: '4px' }}>
                    {c.description}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8C827A' }}>
                    Contact: {c.phone || c.email} • Occasion: {c.occasion || 'Custom Gift'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div style={{ background: '#FAF7F2', borderRadius: '14px', border: '1px solid #EBE4DA', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBE4DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>All Client Orders</h3>
            <span style={{ fontSize: '0.82rem', color: '#746D66' }}>{orders.length} Total Orders in Database</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#F4EFEA', borderBottom: '1px solid #EBE4DA', color: '#746D66' }}>
                  <th style={{ padding: '12px 16px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Items</th>
                  <th style={{ padding: '12px 16px' }}>Total</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #EBE4DA' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#2B2523' }}>
                      #{o.orderNumber}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>{o.guestName || 'Aditya Kumar'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#746D66' }}>{o.guestEmail || 'customer@srijan.com'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {o.items?.map((item: any) => (
                        <div key={item.id} style={{ fontSize: '0.8rem', color: '#4A4542' }}>
                          • {item.productName} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          backgroundColor:
                            o.status === 'DELIVERED' ? '#E8F5E9' :
                            o.status === 'IN_CRAFTING' ? '#FFF8E1' :
                            o.status === 'DISPATCHED' ? '#E3F2FD' : '#F4EFEA',
                          color:
                            o.status === 'DELIVERED' ? '#2E7D32' :
                            o.status === 'IN_CRAFTING' ? '#F57F17' :
                            o.status === 'DISPATCHED' ? '#1565C0' : '#4A4542',
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #EBE4DA',
                          fontSize: '0.8rem',
                          background: '#FFF',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_CRAFTING">IN_CRAFTING</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Products Catalog Manager */}
      {activeTab === 'products' && (
        <div style={{ background: '#FAF7F2', borderRadius: '14px', border: '1px solid #EBE4DA', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBE4DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>Product Inventory ({products.length})</h3>
              <span style={{ fontSize: '0.82rem', color: '#746D66' }}>Manage stock, prices, and add new creations</span>
            </div>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2B2523',
                color: '#FBF9F5',
                padding: '9px 18px',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              <span>Add New Handcrafted Item</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#F4EFEA', borderBottom: '1px solid #EBE4DA', color: '#746D66' }}>
                  <th style={{ padding: '12px 16px' }}>Photo</th>
                  <th style={{ padding: '12px 16px' }}>Name & SKU</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price (INR / USD)</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #EBE4DA' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <img
                        src={p.images?.[0] || '/images/crochet-artisan-floral-bouquet.jpg'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#2B2523' }}>{p.name}</div>
                      <span style={{ fontSize: '0.74rem', color: '#8C827A', fontFamily: 'monospace' }}>{p.sku}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '0.78rem', background: '#F4EFEA', padding: '3px 8px', borderRadius: '4px' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                      ₹{p.priceINR} / ${p.priceUSD}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ color: p.stockQuantity <= 15 ? '#C0392B' : '#2E7D32', fontWeight: 600 }}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setEditPriceINR(String(p.priceINR));
                          setEditStock(String(p.stockQuantity));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFF',
                          border: '1px solid #EBE4DA',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bespoke Commissions */}
      {activeTab === 'commissions' && (
        <div style={{ background: '#FAF7F2', borderRadius: '14px', border: '1px solid #EBE4DA', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBE4DA' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>Custom Commissions Inbox</h3>
            <span style={{ fontSize: '0.82rem', color: '#746D66' }}>Bespoke wedding, anniversary, and entrance nameplate inquiries</span>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {commissions.map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#FDFBF7',
                  border: '1px solid #EBE4DA',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#2B2523' }}>{req.name}</h4>
                    <span style={{ fontSize: '0.82rem', color: '#746D66' }}>
                      Email: {req.email} • Phone: {req.phone || 'Not provided'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', background: '#F4EFEA', padding: '4px 10px', borderRadius: '9999px', fontWeight: 600, color: '#C48B71' }}>
                    {req.category}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#4A4542', background: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid #F0ECE6', marginBottom: '12px' }}>
                  {req.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#746D66' }}>
                  <span>Target Budget: <strong>{req.budgetRange || 'Not specified'}</strong> • Occasion: <strong>{req.occasion || 'Custom'}</strong></span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>Status:</span>
                    <select
                      value={req.status}
                      onChange={async (e) => {
                        await api.customRequests.update(req.id, { status: e.target.value });
                        showToast('Commission status updated!');
                        loadData();
                      }}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #EBE4DA', fontSize: '0.78rem' }}
                    >
                      <option value="INQUIRY_RECEIVED">INQUIRY_RECEIVED</option>
                      <option value="QUOTE_SENT">QUOTE_SENT</option>
                      <option value="IN_CRAFTING">IN_CRAFTING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Contact Messages */}
      {activeTab === 'messages' && (
        <div style={{ background: '#FAF7F2', borderRadius: '14px', border: '1px solid #EBE4DA', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EBE4DA' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>Studio Contact Inquiries</h3>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.length === 0 ? (
              <p style={{ color: '#746D66', textAlign: 'center', padding: '20px' }}>No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} style={{ background: '#FDFBF7', padding: '16px', borderRadius: '10px', border: '1px solid #EBE4DA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: '#2B2523' }}>{m.name} ({m.email})</strong>
                    <span style={{ fontSize: '0.76rem', color: m.isRead ? '#2E7D32' : '#C0392B', fontWeight: 600 }}>
                      {m.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#4A4542', margin: '6px 0 10px' }}>{m.message}</p>
                  {!m.isRead && (
                    <button
                      onClick={() => handleMarkMessageRead(m.id)}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #EBE4DA', background: '#FFF', fontSize: '0.76rem', cursor: 'pointer' }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewProductModalOpen(false)}>
          <div
            className="search-modal-container"
            style={{ maxWidth: '640px', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={() => setIsNewProductModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '18px' }}>
              Add New Handcrafted Item
            </h3>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crochet Lavender Keychain"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  >
                    <option value="Crochet">Crochet</option>
                    <option value="Resin Art">Resin Art</option>
                    <option value="Name Plates">Name Plates</option>
                    <option value="Ceramics & Mugs">Ceramics & Mugs</option>
                    <option value="Plates & Bowls">Plates & Bowls</option>
                    <option value="Home Decor">Home Decor</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPriceINR}
                    onChange={(e) => setNewProdPriceINR(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Price (USD) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPriceUSD}
                    onChange={(e) => setNewProdPriceUSD(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Material *</label>
                  <input
                    type="text"
                    required
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    placeholder="e.g. Milk Cotton Yarn"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Photo URL *</label>
                <input
                  type="text"
                  required
                  placeholder="/images/crochet-artisan-floral-bouquet.jpg"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={3}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingProduct}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '9999px',
                  background: '#2B2523',
                  color: '#FBF9F5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {isSubmittingProduct ? 'Saving...' : 'Publish to Live Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div
            className="search-modal-container"
            style={{ maxWidth: '420px', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>
              Quick Edit: {editingProduct.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#746D66', marginBottom: '16px' }}>SKU: {editingProduct.sku}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Price (INR)</label>
                <input
                  type="number"
                  value={editPriceINR}
                  onChange={(e) => setEditPriceINR(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Stock Quantity</label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <button
                onClick={handleSaveProductEdit}
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  borderRadius: '9999px',
                  background: '#2B2523',
                  color: '#FBF9F5',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
