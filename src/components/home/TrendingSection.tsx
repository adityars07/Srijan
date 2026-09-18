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

        <div className="products-grid">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
