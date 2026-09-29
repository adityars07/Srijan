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
  Trash2,
  Upload,
  Star,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

// Helper: Resize and compress images client-side for fast uploading and crisp display
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface AdminDashboardViewProps {
  onBackToStore: () => void;
}

// Helper: Auto-generate structured tracking ID / SKU based on category
const getCategoryTrackingPrefix = (cat: string): string => {
  const map: Record<string, string> = {
    'Crochet': 'CRO',
    'Resin Art': 'RES',
    'Name Plates': 'NMP',
    'Ceramics & Mugs': 'CER',
    'Plates & Bowls': 'PLB',
    'Home Decor': 'DEC',
    'Lipan': 'LIP',
    'Keychain': 'KEY',
  };
  return map[cat] || 'ART';
};

const generateNewTrackingSku = (cat: string = 'Crochet'): string => {
  const prefix = getCategoryTrackingPrefix(cat);
  const randomSerial = Math.floor(100000 + Math.random() * 900000);
  return `SRJ-${prefix}-${randomSerial}`;
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToStore }) => {
  const { user, isAdmin, login } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useCart();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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
  const [newProdPriceINR, setNewProdPriceINR] = useState('');
  const [newProdPriceUSD, setNewProdPriceUSD] = useState('');
  const [newProdSku, setNewProdSku] = useState(() => generateNewTrackingSku('Crochet'));

  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdUrlInput, setNewProdUrlInput] = useState('');
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [newProdStock, setNewProdStock] = useState('10');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const openAddProductModal = () => {
    setNewProdSku(generateNewTrackingSku(newProdCategory));
    setIsNewProductModalOpen(true);
  };

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

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingPhotos(true);
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    try {
      const converted = await Promise.all(fileArray.map((f) => processImageFile(f)));
      setNewProdImages((prev) => [...prev, ...converted]);
      showToast(`Added ${converted.length} product photo${converted.length === 1 ? '' : 's'}.`);
    } catch {
      showToast('Error processing some image files.');
    } finally {
      setIsProcessingPhotos(false);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = newProdUrlInput.trim();
    if (!trimmed) return;
    if (newProdImages.includes(trimmed)) {
      showToast('This image URL has already been added.');
      return;
    }
    setNewProdImages((prev) => [...prev, trimmed]);
    setNewProdUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNewProdImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setNewProdImages((prev) => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
    showToast('Main cover photo updated!');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Include URL input if artisan typed one and hasn't clicked Add URL yet
    let finalImages = [...newProdImages];
    if (newProdUrlInput.trim() && !finalImages.includes(newProdUrlInput.trim())) {
      finalImages.push(newProdUrlInput.trim());
    }

    if (finalImages.length === 0) {
      showToast('Please add at least one product photo.');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      await api.products.create({
        name: newProdName,
        category: newProdCategory,
        priceINR: parseFloat(newProdPriceINR),
        priceUSD: parseFloat(newProdPriceUSD),
        sku: newProdSku,
        description: newProdDescription,
        stockQuantity: parseInt(newProdStock, 10),
        images: finalImages,
        colors: [{ name: 'Default Studio Color', hex: '#C48B71' }],
        sizes: ['Standard'],
      });
      showToast(`New handcrafted item with ${finalImages.length} photo${finalImages.length === 1 ? '' : 's'} added to live catalog!`);
      setIsNewProductModalOpen(false);
      setNewProdName('');
      setNewProdDescription('');
      setNewProdPriceINR('');
      setNewProdPriceUSD('');
      setNewProdSku(generateNewTrackingSku('Crochet'));
      setNewProdImages([]);
      setNewProdUrlInput('');
      setNewProdStock('10');
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
      const stock = isNaN(parseInt(editStock, 10)) ? 0 : parseInt(editStock, 10);
      await api.products.update(editingProduct.id, {
        priceINR: parseFloat(editPriceINR),
        stockQuantity: stock,
        inStock: stock > 0,
      });
      showToast(stock === 0 ? 'Product updated & marked as Out of Stock (0 units).' : 'Product updated successfully!');
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the catalog?`)) {
      return;
    }
    try {
      await api.products.delete(id);
      showToast(`"${name}" was deleted successfully.`);
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product');
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
            Sign in with your admin credentials to manage products, inventory, commissions, and orders.
          </p>

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
                placeholder="admin@srijan.com"
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
                placeholder="••••••••••••"
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
              {formatPrice(metrics.totalRevenueINR ?? metrics.totalRevenue ?? 0)}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              ${metrics.totalRevenueUSD ?? Math.round((metrics.totalRevenue || 0) / 83)} USD total revenue
            </div>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2B2523', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
              <Package size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {metrics.totalOrders || 0}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#746D66', marginTop: '4px' }}>
              {metrics.orderStatusCounts?.IN_CRAFTING ?? metrics.pendingOrders ?? 0} in active crafting
            </div>
          </div>

          <div style={{ background: '#FAF7F2', padding: '20px', borderRadius: '12px', border: '1px solid #EBE4DA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B86F52', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bespoke Inquiries</span>
              <HeartHandshake size={18} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, color: '#2B2523' }}>
              {metrics.pendingCustomRequests ?? metrics.pendingCommissions ?? 0}
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
              {metrics.lowStockCount ?? metrics.outOfStock ?? 0}
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
                      <div>{o.guestName || 'Customer'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#746D66' }}>{o.guestEmail || '—'}</div>
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
              onClick={openAddProductModal}
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
                      {p.stockQuantity === 0 || !p.inStock ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#9B1C1C',
                            backgroundColor: '#FDF2F2',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            border: '1px solid #F8B4B4',
                          }}
                        >
                          ● Out of Stock (0 units)
                        </span>
                      ) : (
                        <span style={{ color: p.stockQuantity <= 15 ? '#E67E22' : '#2E7D32', fontWeight: 600 }}>
                          {p.stockQuantity} units left
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setEditPriceINR(String(p.priceINR));
                            setEditStock(String(p.stockQuantity));
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FFF',
                            border: '1px solid #EBE4DA',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                          title="Edit product price & inventory"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FDF2F2',
                            color: '#9B1C1C',
                            border: '1px solid #F8B4B4',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                          title={`Permanently delete "${p.name}"`}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
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
            style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '32px' }}
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
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setNewProdCategory(newCat);
                      setNewProdSku(generateNewTrackingSku(newCat));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                  >
                    <option value="Crochet">Crochet</option>
                    <option value="Resin Art">Resin Art</option>
                    <option value="Name Plates">Name Plates</option>
                    <option value="Ceramics & Mugs">Ceramics & Mugs</option>
                    <option value="Plates & Bowls">Plates & Bowls</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Lipan">Lipan</option>
                    <option value="Keychain">Keychain</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product Tracking ID / SKU *</label>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        backgroundColor: '#F5EFEB',
                        color: '#C48B71',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #EBE4DA',
                      }}
                    >
                      Auto-Assigned
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      required
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      placeholder="e.g. SRJ-CRO-849201"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #EBE4DA',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    />
                    <button
                      type="button"
                      title="Generate new Tracking ID"
                      onClick={() => {
                        const newId = generateNewTrackingSku(newProdCategory);
                        setNewProdSku(newId);
                        showToast(`New Tracking ID generated: ${newId}`);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #EBE4DA',
                        backgroundColor: '#FAF8F5',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2B2523',
                      }}
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
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

              <div>
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

              {/* Multiple Product Photos Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2B2523' }}>
                    Product Photos *{' '}
                    <span style={{ fontSize: '0.74rem', color: '#8C827A', fontWeight: 400 }}>
                      ({newProdImages.length} photo{newProdImages.length === 1 ? '' : 's'} added &bull; First is cover image)
                    </span>
                  </label>
                  {newProdImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNewProdImages([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9B1C1C',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Clear All Photos
                    </button>
                  )}
                </div>

                {/* Paste URL Input & Add Button */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="Paste image web URL..."
                    value={newProdUrlInput}
                    onChange={(e) => setNewProdUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #EBE4DA',
                      fontSize: '0.84rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!newProdUrlInput.trim()}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: newProdUrlInput.trim() ? '#2B2523' : '#F0EBE5',
                      color: newProdUrlInput.trim() ? '#FBF9F5' : '#A0978E',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: newProdUrlInput.trim() ? 'pointer' : 'not-allowed',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Plus size={14} />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Drag and Drop / Device File Upload Zone */}
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPhotos(true);
                  }}
                  onDragLeave={() => setIsDraggingPhotos(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPhotos(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '16px 12px',
                    borderRadius: '8px',
                    border: isDraggingPhotos ? '2px dashed #C48B71' : '1.5px dashed #DDCFC5',
                    backgroundColor: isDraggingPhotos ? '#F7EBE1' : '#FAF8F5',
                    cursor: isProcessingPhotos ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C48B71' }}>
                    <Upload size={18} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#2B2523' }}>
                      {isProcessingPhotos ? 'Processing Photos...' : 'Upload multiple photos from device'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#8C827A' }}>
                    Click or drag & drop JPG, PNG, WEBP (Select multiple photos at once)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isProcessingPhotos}
                    onChange={(e) => {
                      handleFilesSelected(e.target.files);
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Multiple Photos Thumbnail Grid */}
                {newProdImages.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '10px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      padding: '10px',
                      backgroundColor: '#FAF8F5',
                      borderRadius: '8px',
                      border: '1px solid #EBE4DA',
                      marginTop: '4px',
                    }}
                  >
                    {newProdImages.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid #C48B71' : '1px solid #E0D7CC',
                          backgroundColor: '#FFF',
                          boxShadow: idx === 0 ? '0 2px 8px rgba(196, 139, 113, 0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <img
                          src={img}
                          alt={`Product preview ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Primary Badge or Make Cover Action */}
                        {idx === 0 ? (
                          <span
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: '#C48B71',
                              color: '#FFF',
                              fontSize: '0.58rem',
                              fontWeight: 700,
                              padding: '2px 5px',
                              borderRadius: '4px',
                              letterSpacing: '0.04em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <Star size={8} fill="#FFF" /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            title="Set as main catalog cover photo"
                            onClick={() => handleSetPrimaryImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              backgroundColor: 'rgba(43, 37, 35, 0.75)',
                              color: '#FFF',
                              fontSize: '0.58rem',
                              border: 'none',
                              borderRadius: '3px',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Photo Button */}
                        <button
                          type="button"
                          title="Remove photo"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(43, 37, 35, 0.85)',
                            color: '#FFF',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X size={10} />
                        </button>

                        {/* Order Index */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            right: '4px',
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            color: '#FFF',
                            fontSize: '0.58rem',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontWeight: 600,
                          }}
                        >
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
            <p style={{ fontSize: '0.82rem', color: '#746D66', marginBottom: '16px' }}>
              Tracking ID / SKU: <strong style={{ fontFamily: 'monospace', color: '#2B2523' }}>{editingProduct.sku}</strong>
            </p>

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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Stock Quantity <span style={{ fontSize: '0.74rem', color: '#8C827A', fontWeight: 400 }}>(Set to 0 to mark as Out of Stock)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #EBE4DA' }}
                />
              </div>

              <button
                onClick={handleSaveProductEdit}
                style={{
                  marginTop: '6px',
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

              <button
                type="button"
                onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                style={{
                  padding: '10px',
                  borderRadius: '9999px',
                  background: '#FDF2F2',
                  color: '#9B1C1C',
                  border: '1px solid #F8B4B4',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Trash2 size={14} />
                <span>Delete This Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
