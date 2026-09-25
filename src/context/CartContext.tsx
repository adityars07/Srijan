import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product, ProductColor } from '../types';

interface ToastInfo {
  message: string;
  type: 'success' | 'info';
  timestamp: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string, slug?: string) => void;
  isWishlisted: (productId: string, slug?: string) => boolean;
  wishlistCount: number;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  clearWishlist: () => void;

  // Promo code
  promoCode: string;
  discountPercentage: number;
  promoError: string | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('srijan_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('srijan_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('srijan_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('srijan_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type, timestamp: Date.now() });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (product: Product, color: ProductColor, size: string, quantity = 1) => {
    if (product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      showToast(`"${product.name}" is currently out of stock.`, 'info');
      return;
    }
    const itemId = `${product.id}-${color.name}-${size}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
        },
      ];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);
  const toggleWishlistDrawer = () => setIsWishlistOpen((prev) => !prev);
  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared', 'info');
  };

  const toggleWishlist = (productId: string, slug?: string) => {
    setWishlist((prev) => {
      const idsToCheck = [productId, slug].filter(Boolean) as string[];
      const exists = idsToCheck.some((id) => prev.includes(id));
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => !idsToCheck.includes(id));
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string, slug?: string): boolean => {
    if (!productId && !slug) return false;
    if (productId && wishlist.includes(productId)) return true;
    if (slug && wishlist.includes(slug)) return true;
    return false;
  };

  const applyPromoCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SRIJAN10' || cleanCode === 'TERRA10' || cleanCode === 'RAKHI10') {
      setPromoCode(cleanCode);
      setDiscountPercentage(10);
      setPromoError(null);
      showToast('10% discount applied!');
      return true;
    } else if (cleanCode === 'FESTIVE15') {
      setPromoCode(cleanCode);
      setDiscountPercentage(15);
      setPromoError(null);
      showToast('15% festive discount applied!');
      return true;
    } else {
      setPromoError('Invalid coupon code. Try SRIJAN10 or FESTIVE15');
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercentage(0);
    setPromoError(null);
    showToast('Promo code removed', 'info');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer,
        clearWishlist,
        promoCode,
        discountPercentage,
        promoError,
        applyPromoCode,
        removePromoCode,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
