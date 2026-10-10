import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from '../shop/ProductCard';

interface TrendingSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSeeAllClick: () => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  products,
  onSelectProduct,
  onSeeAllClick,
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedProducts = showAll ? products : products.slice(0, 8);

  return (
    <section style={{ padding: '20px 0 60px' }}>
      <div className="container">
        <div className="section-header" style={{ alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <div className="section-eyebrow">Curated Collection</div>
            <h2 className="section-title">Trending Now</h2>
            <p style={{ color: '#746D66', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Showing {displayedProducts.length} of {products.length} bespoke artisan creations
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {products.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C48B71',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s ease',
                }}
              >
                <span>{showAll ? 'Show 8' : `Show All (${products.length})`}</span>
                {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}

            <button className="see-all-link" onClick={onSeeAllClick} title="Open full shop catalog with filters">
              <span>Full Catalog</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                marginTop: '40px',
              }}
            >
              {products.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    borderRadius: '9999px',
                    backgroundColor: showAll ? '#FAF7F2' : '#2B2523',
                    color: showAll ? '#2B2523' : '#FBF9F5',
                    border: showAll ? '1px solid #EBE4DA' : 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: showAll ? 'none' : '0 4px 14px rgba(43, 37, 35, 0.12)',
                  }}
                >
                  <span>{showAll ? 'Show Fewer Creations ↑' : `Show All Products (${products.length} Creations) ↓`}</span>
                  {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}

              <button
                type="button"
                onClick={onSeeAllClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  backgroundColor: '#FAF7F2',
                  color: '#2B2523',
                  border: '1px solid #EBE4DA',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Browse Full Catalog with Filters</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              backgroundColor: '#FBF9F5',
              borderRadius: '16px',
              border: '1px dashed #EBE4DA',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#2B2523', marginBottom: '8px' }}>
              Handcrafted Inventory Loading
            </h3>
            <p style={{ color: '#746D66', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Our artisan studio is ready for new creations. Publish products in the Admin Dashboard to feature them here!
            </p>
            <button className="see-all-link" onClick={onSeeAllClick}>
              <span>Browse Catalog</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
