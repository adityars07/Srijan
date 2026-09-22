import React, { useMemo, useState } from 'react';
import { ChevronRight, X, Heart } from 'lucide-react';
import type { Product, FilterState } from '../../types';
import { FilterSidebar } from './FilterSidebar';
import { ProductCard } from './ProductCard';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

interface ShopCatalogViewProps {
  products: Product[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
}

export const ShopCatalogView: React.FC<ShopCatalogViewProps> = ({
  products,
  filters,
  onFilterChange,
  onSelectProduct,
  onNavigateHome,
}) => {
  const { currency } = useCurrency();
  const { isWishlisted, wishlistCount, openWishlist } = useCart();
  const [onlyWishlist, setOnlyWishlist] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Wishlist filter
      if (onlyWishlist && !isWishlisted(p.id, (p as any).slug)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) {
        return false;
      }

      // Collection filter
      if (filters.collections.length > 0 && !filters.collections.includes(p.collection)) {
        return false;
      }

      // Price filter
      const price = currency === 'INR' ? p.priceINR : p.priceUSD;
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) {
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesCol = p.collection.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesCol) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = currency === 'INR' ? a.priceINR : a.priceUSD;
      const priceB = currency === 'INR' ? b.priceINR : b.priceUSD;
      if (filters.sortBy === 'price-asc') return priceA - priceB;
      if (filters.sortBy === 'price-desc') return priceB - priceA;
      if (filters.sortBy === 'newest') return b.id.localeCompare(a.id);
      return b.rating - a.rating; // default popular
    });
  }, [products, filters, currency, onlyWishlist, isWishlisted]);

  const handleClearAll = () => {
    setOnlyWishlist(false);
    onFilterChange({
      categories: [],
      priceRange: [0, 999999],
      collections: [],
      materials: [],
      sortBy: 'popular',
      searchQuery: '',
    });
  };

  const removeCategory = (cat: string) => {
    onFilterChange({
      ...filters,
      categories: filters.categories.filter((c) => c !== cat),
    });
  };

  const removeCollection = (col: string) => {
    onFilterChange({
      ...filters,
      collections: filters.collections.filter((c) => c !== col),
    });
  };

  const resetPrice = () => {
    onFilterChange({
      ...filters,
      priceRange: [0, 999999],
    });
  };

  const hasActiveFilters =
    onlyWishlist ||
    filters.categories.length > 0 ||
    filters.collections.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 999999 ||
    Boolean(filters.searchQuery);

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#746D66', marginBottom: '24px' }}>
          <button onClick={onNavigateHome} style={{ color: '#746D66' }}>Home</button>
          <ChevronRight size={14} />
          <span>Shop</span>
          <ChevronRight size={14} />
          <span style={{ color: '#2B2523', fontWeight: 600 }}>All Creations</span>
        </div>

        {/* Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 500, color: '#2B2523' }}>
              Handcrafted Collection
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#746D66', marginTop: '4px' }}>
              Showing {filteredProducts.length} unique pieces curated by Rakhi
            </p>
          </div>

          {/* Quick Filters & Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setOnlyWishlist(!onlyWishlist)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: onlyWishlist ? '1px solid #C48B71' : '1px solid #EBE4DA',
                background: onlyWishlist ? '#F4EFEA' : 'white',
                color: onlyWishlist ? '#C48B71' : '#2B2523',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Heart
                size={15}
                fill={onlyWishlist ? '#C48B71' : 'none'}
                stroke={onlyWishlist ? '#C48B71' : 'currentColor'}
              />
              <span>Saved in Wishlist ({wishlistCount})</span>
            </button>

            <span style={{ fontSize: '0.84rem', color: '#746D66' }}>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #EBE4DA',
                background: 'white',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#2B2523',
                cursor: 'pointer',
              }}
            >
              <option value="popular">Popular & Highly Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', padding: '12px 16px', background: '#F4EFEA', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#746D66' }}>Filters:</span>

            {onlyWishlist && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  color: '#C48B71',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid #C48B71',
                }}
              >
                <Heart size={12} fill="#C48B71" stroke="#C48B71" />
                Wishlist Only
                <X size={13} style={{ cursor: 'pointer' }} onClick={() => setOnlyWishlist(false)} />
              </span>
            )}
            
            {filters.categories.map((cat) => (
              <span
                key={cat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #EBE4DA',
                }}
              >
                {cat}
                <X size={13} style={{ cursor: 'pointer' }} onClick={() => removeCategory(cat)} />
              </span>
            ))}

            {filters.collections.map((col) => (
              <span
                key={col}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #EBE4DA',
                }}
              >
                {col}
                <X size={13} style={{ cursor: 'pointer' }} onClick={() => removeCollection(col)} />
              </span>
            ))}

            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #EBE4DA',
                }}
              >
                {currency === 'INR' ? `₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}` : `$${filters.priceRange[0]} - $${filters.priceRange[1]}`}
                <X size={13} style={{ cursor: 'pointer' }} onClick={resetPrice} />
              </span>
            )}

            {filters.searchQuery && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid #EBE4DA',
                }}
              >
                "{filters.searchQuery}"
                <X size={13} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ ...filters, searchQuery: '' })} />
              </span>
            )}

            <button
              onClick={handleClearAll}
              style={{
                fontSize: '0.82rem',
                color: '#C48B71',
                fontWeight: 600,
                textDecoration: 'underline',
                marginLeft: 'auto',
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Grid */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={handleClearAll}
          />

          <div style={{ flex: 1 }}>
            {filteredProducts.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '24px',
                }}
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  background: '#F4EFEA',
                  borderRadius: '16px',
                  border: '1px dashed #EBE4DA',
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>
                  No handcrafted pieces match this filter
                </h4>
                <p style={{ color: '#746D66', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Try resetting your price or category selections to explore all studio works.
                </p>
                <button
                  onClick={handleClearAll}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    backgroundColor: '#2B2523',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
