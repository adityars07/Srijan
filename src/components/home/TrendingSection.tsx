import React from 'react';
import { ArrowUpRight } from 'lucide-react';
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
  return (
    <section style={{ padding: '20px 0 60px' }}>
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Curated Collection</div>
            <h2 className="section-title">Trending Now</h2>
          </div>

          <button className="see-all-link" onClick={onSeeAllClick}>
            <span>See all</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
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
