import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, Plus, Minus, ChevronDown } from 'lucide-react';
import type { Product, ProductColor } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PRODUCTS } from '../../data/mockData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectRelated,
}) => {
  const { addToCart, isWishlisted, toggleWishlist, showToast } = useCart();
  const { formatProductPrice } = useCurrency();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [careOpen, setCareOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0] || null);
      setSelectedSize(product.defaultSize || product.sizes[0] || 'Standard');
      setQuantity(1);
      setCareOpen(false);
      setDeliveryOpen(false);
    }
  }, [product]);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id, (product as any).slug);

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!');
  };

  // Related products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  // Social proof customer lifestyle shots (using real product photos)
  const customerShots = [
    { user: '@home_by_ananya', img: '/images/crochet-artisan-floral-bouquet.jpg' },
    { user: '@clayandlight', img: '/images/buddha_nameplate.jpg' },
    { user: '@minimal_living', img: '/images/sculptural_vase.jpg' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-body">
          {/* Top Bar: Breadcrumbs + Close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="modal-breadcrumbs">
              <span>Shop</span>
              <span>›</span>
              <span>{product.category}</span>
              <span>›</span>
              <span style={{ color: '#2B2523', fontWeight: 600 }}>{product.name}</span>
            </div>

            <button className="icon-action-btn" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>

          {/* Main 2-Column Product Layout */}
          <div className="product-detail-layout">
            {/* Gallery Column: Thumbnails + Large View */}
            <div className="gallery-col">
              <div className="gallery-thumbnails">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`gallery-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} angle ${idx + 1}`} />
                  </div>
                ))}
              </div>

              <div className="gallery-main-view">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                />
              </div>
            </div>

            {/* Product Info & Purchase Controls */}
            <div className="product-info-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 className="modal-product-title">{product.name}</h2>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`icon-action-btn ${wishlisted ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product.id, (product as any).slug)}
                    title="Wishlist"
                  >
                    <Heart size={18} fill={wishlisted ? '#D94343' : 'none'} stroke={wishlisted ? '#D94343' : 'currentColor'} />
                  </button>
                  <button className="icon-action-btn" onClick={handleShare} title="Share">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Price & SKU */}
              <div className="modal-price-status-row">
                <span className="modal-price">{formatProductPrice(product)}</span>
                <span className="modal-stock-tag">
                  {product.inStock ? `In Stock • SKU: ${product.sku}` : 'Made to Order'}
                </span>
              </div>

              <p className="modal-description">{product.description}</p>

              {/* Collection badge */}
              <div style={{ fontSize: '0.82rem', color: '#746D66', marginBottom: '18px' }}>
                <strong>Collection:</strong> <span style={{ color: '#C48B71', fontWeight: 600 }}>{product.collection}</span>
              </div>

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="selector-block">
                  <div className="selector-label">
                    Color Shade: <span style={{ fontWeight: 400, color: '#746D66' }}>{selectedColor?.name}</span>
                  </div>
                  <div className="color-swatches-list">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`color-swatch-circle ${selectedColor?.name === color.name ? 'active' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setSelectedColor(color)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size / Capacity Options */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="selector-block">
                  <div className="selector-label">Selection / Size:</div>
                  <div className="sizes-pills-list">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-pill-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Add to Cart Button */}
              <div className="modal-cta-row">
                <div className="qty-stepper" style={{ padding: '8px 16px' }}>
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    <Minus size={15} />
                  </button>
                  <span className="qty-val" style={{ minWidth: '24px', fontSize: '0.95rem' }}>{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>
                    <Plus size={15} />
                  </button>
                </div>

                <button className="modal-add-cart-btn" onClick={handleAddToCart}>
                  <span>Add to the cart</span>
                </button>
              </div>

              {/* Accordions: Care Instructions & Delivery & Return */}
              <div className="info-accordions-group">
                <div className="info-accordion-item">
                  <button className="info-accordion-header" onClick={() => setCareOpen(!careOpen)}>
                    <span>Care Instructions</span>
                    <ChevronDown size={16} style={{ transform: careOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                  {careOpen && (
                    <div className="info-accordion-body">
                      {product.careInstructions}
                    </div>
                  )}
                </div>

                <div className="info-accordion-item">
                  <button className="info-accordion-header" onClick={() => setDeliveryOpen(!deliveryOpen)}>
                    <span>Delivery & Custom Returns</span>
                    <ChevronDown size={16} style={{ transform: deliveryOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                  {deliveryOpen && (
                    <div className="info-accordion-body">
                      {product.deliveryInfo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof: Seen by You (Lifestyle Community Shots) */}
          <div style={{ marginTop: '54px', paddingTop: '32px', borderTop: '1px solid #EBE4DA' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '18px' }}>
              Seen in your homes:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {customerShots.map((shot, idx) => (
                <div key={idx} style={{ position: 'relative', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={shot.img} alt={shot.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '9999px', backdropFilter: 'blur(4px)' }}>
                    {shot.user}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations: You May Also Like */}
          <div style={{ marginTop: '48px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '20px' }}>
              You may also like:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectRelated(rel)}
                >
                  <div style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#F4EFEA', marginBottom: '8px' }}>
                    <img src={rel.images[0]} alt={rel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#2B2523' }}>{rel.name}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#746D66', marginTop: '2px' }}>{formatProductPrice(rel)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
