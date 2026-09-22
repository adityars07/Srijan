import React, { useMemo } from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PRODUCTS } from '../../data/mockData';
import type { Product } from '../../types';

interface WishlistDrawerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onExploreMore: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  products,
  onSelectProduct,
  onExploreMore,
}) => {
  const {
    wishlist,
    isWishlistOpen,
    closeWishlist,
    openCart,
    toggleWishlist,
    isWishlisted,
    clearWishlist,
    addToCart,
    showToast,
  } = useCart();

  const { formatProductPrice, formatProductOriginalPrice } = useCurrency();

  // Match wishlisted items from live products or mock catalog
  const wishlistedProducts = useMemo(() => {
    const list: Product[] = [];
    const seen = new Set<string>();

    const checkAndAdd = (p: Product) => {
      const match = isWishlisted(p.id, (p as any).slug);
      const identifier = p.id || (p as any).slug;
      if (match && !seen.has(identifier)) {
        seen.add(p.id);
        if ((p as any).slug) seen.add((p as any).slug);
        list.push(p);
      }
    };

    products.forEach(checkAndAdd);
    PRODUCTS.forEach(checkAndAdd);

    return list;
  }, [products, wishlist, isWishlisted]);

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addToCart(product, product.colors[0], product.defaultSize, 1);
    showToast(`"${product.name}" added to bag!`);
  };

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((product) => {
      addToCart(product, product.colors[0], product.defaultSize, 1);
    });
    closeWishlist();
    openCart();
    showToast(`Added ${wishlistedProducts.length} creations to your bag!`);
  };

  return (
    <div className="modal-backdrop" onClick={closeWishlist}>
      <aside
        className="cart-drawer-panel"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F4EFEA',
                color: '#C48B71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={18} fill="#C48B71" stroke="#C48B71" />
            </div>
            <div>
              <h3 className="cart-drawer-title" style={{ fontSize: '1.35rem' }}>
                Saved Creations
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#746D66' }}>
                {wishlistedProducts.length} item{wishlistedProducts.length !== 1 ? 's' : ''} saved in your personal wishlist
              </span>
            </div>
          </div>
          <button
            className="icon-action-btn"
            onClick={closeWishlist}
            aria-label="Close wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="cart-drawer-items" style={{ padding: '16px 24px' }}>
          {wishlistedProducts.length > 0 ? (
            wishlistedProducts.map((product) => (
              <div
                key={product.id || (product as any).slug}
                className="cart-item-card"
                style={{
                  padding: '16px 0',
                  alignItems: 'center',
                  gap: '16px',
                  borderBottom: '1px solid #F0ECE4',
                }}
              >
                {/* Product Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    width: '84px',
                    height: '92px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#F7F4EF',
                  }}
                  onClick={() => {
                    closeWishlist();
                    onSelectProduct(product);
                  }}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {product.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        backgroundColor: 'rgba(43, 37, 35, 0.88)',
                        color: '#FBF9F5',
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        padding: '2px 5px',
                        borderRadius: '3px',
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Details & Actions */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#C48B71',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '3px',
                    }}
                  >
                    {product.category}
                  </div>

                  <h4
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#2B2523',
                      lineHeight: 1.3,
                      marginBottom: '6px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={product.name}
                    onClick={() => {
                      closeWishlist();
                      onSelectProduct(product);
                    }}
                  >
                    {product.name}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#2B2523' }}>
                      {formatProductPrice(product)}
                    </span>
                    {product.originalPriceINR && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: '#A0988E',
                          textDecoration: 'line-through',
                        }}
                      >
                        {formatProductOriginalPrice(product)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      style={{
                        padding: '7px 14px',
                        backgroundColor: '#2B2523',
                        color: '#FBF9F5',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C48B71')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2B2523')}
                    >
                      <ShoppingBag size={13} />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id, (product as any).slug)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid #EBE4DA',
                        background: 'white',
                        color: '#746D66',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#D94343';
                        e.currentTarget.style.borderColor = '#FCDADA';
                        e.currentTarget.style.backgroundColor = '#FDEDEC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#746D66';
                        e.currentTarget.style.borderColor = '#EBE4DA';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#F4EFEA',
                  color: '#C48B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Heart size={30} strokeWidth={1.5} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '8px' }}>
                Your Wishlist is Empty
              </h4>
              <p
                style={{
                  color: '#746D66',
                  fontSize: '0.88rem',
                  maxWidth: '300px',
                  lineHeight: 1.5,
                  marginBottom: '24px',
                }}
              >
                Tap the heart on any handcrafted piece while browsing our collection to save it here for later.
              </p>
              <button
                className="see-all-link"
                onClick={() => {
                  closeWishlist();
                  onExploreMore();
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>Explore Artisan Creations</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistedProducts.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '18px 24px',
              borderTop: '1px solid #EBE4DA',
              backgroundColor: '#FBF9F5',
            }}
          >
            <button
              className="checkout-action-btn"
              onClick={handleMoveAllToCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              <span>Move All to Bag ({wishlistedProducts.length})</span>
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
              }}
            >
              <button
                type="button"
                onClick={clearWishlist}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#746D66',
                  fontSize: '0.82rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D94343')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#746D66')}
              >
                Clear entire wishlist
              </button>

              <button
                type="button"
                onClick={() => {
                  closeWishlist();
                  onExploreMore();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C48B71',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 0',
                }}
              >
                <span>Continue shopping</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
