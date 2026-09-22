import React, { useState, useMemo } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { PRODUCTS, ARTICLES } from '../../data/mockData';
import type { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllResults: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [searchTerm, setSearchTerm] = useState('Mug');
  const { formatProductPrice } = useCurrency();

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return PRODUCTS.slice(0, 4);
    const query = searchTerm.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const collections = useMemo(() => {
    const allCollections = [
      { name: 'Minimalist Stoneware', count: '4 pieces', image: '/images/stoneware_mug.jpg' },
      { name: 'Heritage Resin', count: '3 pieces', image: '/images/resin_frame.jpg' },
      { name: 'Boho Blooms', count: '5 pieces', image: '/images/crochet-artisan-floral-bouquet.jpg' },
      { name: 'Earth & Clay', count: '6 pieces', image: '/images/buddha_nameplate.jpg' },
    ];
    if (!searchTerm.trim()) return allCollections;
    const q = searchTerm.toLowerCase();
    return allCollections.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchTerm]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return ARTICLES;
    const query = searchTerm.toLowerCase();
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Header */}
        <div className="search-modal-header">
          <div className="search-modal-input-wrap">
            <Search size={22} color="#746D66" />
            <input
              type="text"
              placeholder="Search creations, categories, or craft techniques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <button className="icon-action-btn" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        {/* 3-Column Search Results Body */}
        <div className="search-modal-body">
          <div className="search-columns-grid">
            {/* Products Column */}
            <div>
              <h5 className="search-col-title">Creations ({filteredProducts.length})</h5>
              <div className="search-results-list">
                {filteredProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="search-item-row"
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                  >
                    <img src={product.images[0]} alt={product.name} className="search-item-thumb" />
                    <div className="search-item-info">
                      <span className="search-item-name">{product.name}</span>
                      <span className="search-item-meta">
                        {product.colors.length} shades • {product.sizes.length} sizes
                      </span>
                      <span className="search-item-price">{formatProductPrice(product)}</span>
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <p style={{ fontSize: '0.86rem', color: '#9E968E', padding: '10px 0' }}>
                    No creations found for "{searchTerm}".
                  </p>
                )}
              </div>
            </div>

            {/* Collections Column */}
            <div>
              <h5 className="search-col-title">Collections</h5>
              <div className="search-results-list">
                {collections.map((col) => (
                  <div
                    key={col.name}
                    className="search-item-row"
                    onClick={() => {
                      onViewAllResults(col.name);
                      onClose();
                    }}
                  >
                    <img src={col.image} alt={col.name} className="search-item-thumb" />
                    <div className="search-item-info">
                      <span className="search-item-name">{col.name}</span>
                      <span className="search-item-meta">{col.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Articles / Stories Column */}
            <div>
              <h5 className="search-col-title">Journal & Stories</h5>
              <div className="search-results-list">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="search-item-row"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <img src={article.image} alt={article.title} className="search-item-thumb" />
                    <div className="search-item-info">
                      <span className="search-item-name">{article.title}</span>
                      <span className="search-item-meta">{article.readTime} • {article.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View All CTA */}
          <button
            className="search-view-all-btn"
            onClick={() => {
              onViewAllResults(searchTerm);
              onClose();
            }}
          >
            <span>View all search results for "{searchTerm}"</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
