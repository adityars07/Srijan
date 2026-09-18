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
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;

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
    return [
      {
        id: 'crochet-artisan-floral-bouquet-Sunflower Sunshine & Daisy-Deluxe Bouquet (7 Stems)',
        product: {
          id: 'crochet-artisan-floral-bouquet',
          name: 'Handcrafted Crochet Floral Bouquet - Sunflower & Blooms',
          category: 'Crochet',
          collection: 'Boho Blooms',
          priceINR: 1850,
          priceUSD: 23,
          originalPriceINR: 2200,
          originalPriceUSD: 28,
          rating: 5.0,
          reviewCount: 42,
          images: [
            '/images/crochet-artisan-floral-bouquet.jpg',
          ],
          description: 'An everlasting artisanal bouquet meticulously hand-crocheted with premium milk cotton yarn.',
          material: 'Premium Milk Cotton Yarn, Floral Stems, Kraft Wrap',
          inStock: true,
          sku: 'SRJ-CR-01',
          colors: [
            { name: 'Sunflower Sunshine & Daisy', hex: '#F4C430' },
          ],
          sizes: ['Deluxe Bouquet (7 Stems)'],
          defaultSize: 'Deluxe Bouquet (7 Stems)',
          careInstructions: 'Gently dust with soft brush.',
          deliveryInfo: 'Dispatched in 2-3 business days.',
        },
        selectedColor: { name: 'Sunflower Sunshine & Daisy', hex: '#F4C430' },
        selectedSize: 'Deluxe Bouquet (7 Stems)',
        quantity: 1,
      },
      {
        id: 'resin-customized-frame-large-Opal & Gold Fleck-Large (32 cm)',
        product: {
          id: 'resin-customized-frame-large',
          name: 'Resin Customized Keepsake Frame - Botanical Gold Platter',
          category: 'Resin Art',
          collection: 'Heritage Resin',
          priceINR: 5500,
          priceUSD: 66,
          originalPriceINR: 6200,
          originalPriceUSD: 75,
          rating: 5.0,
          reviewCount: 52,
          images: [
            '/images/resin_frame.jpg',
          ],
          description: 'Bespoke scalloped-edge resin art platter frame preserved with real handpicked dried wildflowers and 24K pure gold leaf.',
          material: 'High-clarity UV-Resistant Epoxy Resin, Botanical Flora, 24k Gold Foil',
          inStock: true,
          sku: 'SRJ-RS-02',
          colors: [
            { name: 'Opal & Gold Fleck', hex: '#F3EDE2' },
          ],
          sizes: ['Large (32 cm)'],
          defaultSize: 'Large (32 cm)',
          careInstructions: 'Clean gently with microfiber cloth.',
          deliveryInfo: 'Bespoke personalization takes 5-7 days.',
        },
        selectedColor: { name: 'Opal & Gold Fleck', hex: '#F3EDE2' },
        selectedSize: 'Large (32 cm)',
        quantity: 1,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(['crochet-artisan-floral-bouquet']);
  const [promoCode, setPromoCode] = useState<string>('SRIJAN10');
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
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

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlist.includes(productId);
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
