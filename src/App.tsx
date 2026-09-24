import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { Header, type AppView } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/layout/SearchModal';
import { HeroCollage } from './components/home/HeroCollage';
import { CategoryPills } from './components/home/CategoryPills';
import { TrendingSection } from './components/home/TrendingSection';
import { AboutArtisan } from './components/home/AboutArtisan';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { ReviewsSection } from './components/home/ReviewsSection';
import { FAQSection } from './components/home/FAQSection';
import { ArticlesSection } from './components/home/ArticlesSection';
import { ShopCatalogView } from './components/shop/ShopCatalogView';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { CheckoutView } from './components/checkout/CheckoutView';
import { AboutView } from './components/about/AboutView';
import { ContactModal } from './components/contact/ContactModal';
import { AuthModal } from './components/auth/AuthModal';
import { CustomCommissionModal } from './components/custom/CustomCommissionModal';
import { OrderTrackingView } from './components/order/OrderTrackingView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { Toast } from './components/ui/Toast';
import { api } from './services/api';
import type { Product, FilterState, CustomerReview } from './types';

export function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');

  // Live products and reviews state populated purely from backend database
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>([]);

  useEffect(() => {
    // Fetch live products from backend database
    api.products.getAll()
      .then((res) => {
        setProductsList((res.products || []) as Product[]);
      })
      .catch((err) => {
        console.warn('Backend live products fetch error:', err.message);
        setProductsList([]);
      });

    // Fetch live reviews from backend database
    api.reviews.getAll()
      .then((res) => {
        const formatted: CustomerReview[] = (res.reviews || []).map((r: any) => ({
          id: r.id,
          author: r.authorName || r.author || 'Artisan Collector',
          location: r.authorLocation || r.location || 'India',
          rating: r.rating || 5,
          comment: r.comment || '',
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
          productName: r.product?.name,
          productImage: r.product?.images?.[0]?.url,
        }));
        setReviewsList(formatted);
      })
      .catch((err) => {
        console.warn('Backend live reviews fetch error:', err.message);
        setReviewsList([]);
      });
  }, [currentView]);

  // Shop filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 999999],
    collections: [],
    materials: [],
    sortBy: 'popular',
    searchQuery: '',
  });

  const handleNavigate = (view: AppView, category?: string) => {
    setCurrentView(view);
    if (category) {
      setFilters((prev) => ({
        ...prev,
        categories: [category],
        searchQuery: '',
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromPills = (cat: string) => {
    if (cat === 'all') {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      setFilters((prev) => ({ ...prev, categories: [cat] }));
      setCurrentView('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProductById = (id: string) => {
    const found = productsList.find((p) => p.id === id || (p as any).slug === id);
    if (found) setSelectedProduct(found);
  };

  const handleViewAllFromSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      categories: [],
    }));
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="site-wrapper">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommission={() => setIsCommissionOpen(true)}
      />

      <main>
        {currentView === 'home' && (
          <>
            <HeroCollage
              products={productsList}
              onExploreClick={() => handleNavigate('shop')}
              onSelectCategory={(cat) => handleSelectCategoryFromPills(cat)}
              onSelectProductById={handleSelectProductById}
            />

            <CategoryPills
              selectedCategory={filters.categories[0] || 'all'}
              onSelectCategory={handleSelectCategoryFromPills}
            />

            <TrendingSection
              products={productsList}
              onSelectProduct={setSelectedProduct}
              onSeeAllClick={() => handleNavigate('shop')}
            />

            <AboutArtisan onContactClick={() => setIsContactOpen(true)} />

            <CategoryShowcase
              onSelectCategory={(cat) => {
                setFilters((prev) => ({ ...prev, categories: [cat] }));
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <ReviewsSection reviews={reviewsList} />

            <FAQSection onContactClick={() => setIsContactOpen(true)} />

            <ArticlesSection />
          </>
        )}

        {currentView === 'shop' && (
          <ShopCatalogView
            products={productsList}
            filters={filters}
            onFilterChange={setFilters}
            onSelectProduct={setSelectedProduct}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            onContactClick={() => setIsContactOpen(true)}
            onExploreClick={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            onOrderSuccess={() => {}}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateTracking={(orderNum) => {
              setTrackingOrderNumber(orderNum);
              handleNavigate('tracking');
            }}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingView
            initialOrderNumber={trackingOrderNumber}
            onBackToShopping={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onBackToStore={() => handleNavigate('home')}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        allProducts={productsList}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={productsList}
        onSelectProduct={setSelectedProduct}
        onViewAllResults={handleViewAllFromSearch}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
        onExploreMore={() => handleNavigate('shop')}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        products={productsList}
        onSelectProduct={setSelectedProduct}
        onExploreMore={() => handleNavigate('shop')}
      />

      {/* Direct Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Customer / Admin Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {}}
      />

      {/* Bespoke Custom Creation Inquiry Modal */}
      <CustomCommissionModal
        isOpen={isCommissionOpen}
        onClose={() => setIsCommissionOpen(false)}
      />

      {/* Live Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
