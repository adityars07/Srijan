import { useState } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
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
import { CheckoutView } from './components/checkout/CheckoutView';
import { AboutView } from './components/about/AboutView';
import { ContactModal } from './components/contact/ContactModal';
import { Toast } from './components/ui/Toast';
import { PRODUCTS, REVIEWS } from './data/mockData';
import type { Product, FilterState } from './types';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'checkout'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Shop filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 999999],
    collections: [],
    materials: [],
    sortBy: 'popular',
    searchQuery: '',
  });

  const handleNavigate = (view: 'home' | 'shop' | 'about' | 'checkout', category?: string) => {
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
    const found = PRODUCTS.find((p) => p.id === id);
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
      />

      <main>
        {currentView === 'home' && (
          <>
            <HeroCollage
              onExploreClick={() => handleNavigate('shop')}
              onSelectCategory={(cat) => handleSelectCategoryFromPills(cat)}
              onSelectProductById={handleSelectProductById}
            />

            <CategoryPills
              selectedCategory={filters.categories[0] || 'all'}
              onSelectCategory={handleSelectCategoryFromPills}
            />

            <TrendingSection
              products={PRODUCTS}
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

            <ReviewsSection reviews={REVIEWS} />

            <FAQSection onContactClick={() => setIsContactOpen(true)} />

            <ArticlesSection />
          </>
        )}

        {currentView === 'shop' && (
          <ShopCatalogView
            products={PRODUCTS}
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
            onOrderSuccess={() => handleNavigate('home')}
            onNavigateHome={() => handleNavigate('home')}
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
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={setSelectedProduct}
        onViewAllResults={handleViewAllFromSearch}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
        onExploreMore={() => handleNavigate('shop')}
      />

      {/* Direct Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Live Toast Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </CurrencyProvider>
  );
}
