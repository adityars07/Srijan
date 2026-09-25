import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isWishlisted, toggleWishlist, addToCart } = useCart();
  const { formatProductPrice, formatProductOriginalPrice } = useCurrency();

  const wishlisted = isWishlisted(product.id, (product as any).slug);

  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, product.colors[0], product.defaultSize, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id, (product as any).slug);
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={() => onSelect(product)}>
      {/* Product Image Frame */}
      <div className="product-image-wrap">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          style={isOutOfStock ? { filter: 'grayscale(25%)', opacity: 0.88 } : undefined}
        />

        {/* Badge: Out of Stock or custom badge */}
        {isOutOfStock ? (
          <span
            className="card-badge"
            style={{
              backgroundColor: '#9B1C1C',
              color: '#FFFFFF',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            Out of Stock
          </span>
        ) : product.badge ? (
          <span className="card-badge">{product.badge}</span>
        ) : null}

        {/* Wishlist Heart */}
        <button
          className={`wishlist-heart-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={wishlisted ? '#D94343' : 'none'} stroke={wishlisted ? '#D94343' : 'currentColor'} />
        </button>

        {/* Quick Cart Button or Sold Out Indicator */}
        {!isOutOfStock ? (
          <button
            className="quick-cart-btn"
            onClick={handleQuickAdd}
            title="Quick add to cart"
            aria-label="Quick Add"
          >
            <ShoppingBag size={17} />
          </button>
        ) : (
          <span
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(43, 37, 35, 0.85)',
              color: '#FBF9F5',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            Sold Out
          </span>
        )}
      </div>

      {/* Color Swatches */}
      {product.colors && product.colors.length > 0 && (
        <div className="card-swatches">
          {product.colors.map((color) => (
            <span
              key={color.name}
              className="swatch-dot"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      )}

      {/* Meta Information */}
      <div className="product-meta-row">
        <h4 className="product-card-title">{product.name}</h4>
        <span className="product-card-category">{product.category} • {product.collection}</span>
        
        <div className="product-card-price-row">
          <span className="product-card-price">{formatProductPrice(product)}</span>
          {product.originalPriceINR && (
            <span className="product-card-original-price">
              {formatProductOriginalPrice(product)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
