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
        id: 'aurora-brew-mug-speckled-Oatmeal Speckle-330 ml',
        product: {
          id: 'aurora-brew-mug-speckled',
          name: 'Aurora Brew Mug - Speckled Sand 330 ml',
          category: 'Ceramics & Mugs',
          collection: 'Minimalist Stoneware',
          priceINR: 1250,
          priceUSD: 15,
          originalPriceINR: 1500,
          originalPriceUSD: 18,
          rating: 4.9,
          reviewCount: 64,
          images: [
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
          ],
          description: 'Wheel-thrown ceramic stoneware mug with volcanic mineral specks.',
          material: 'Natural Stoneware Clay',
          inStock: true,
          sku: 'SRJ-CR-04',
          colors: [
            { name: 'Oatmeal Speckle', hex: '#E7DFD5' },
          ],
          sizes: ['330 ml'],
          defaultSize: '330 ml',
          careInstructions: 'Microwave and dishwasher safe.',
          deliveryInfo: 'Usually delivered in 3-4 working days.',
        },
        selectedColor: { name: 'Oatmeal Speckle', hex: '#E7DFD5' },
        selectedSize: '330 ml',
        quantity: 1,
      },
      {
        id: 'harmony-sculptural-vase-Chalk White-Medium (30 cm)',
        product: {
          id: 'harmony-sculptural-vase',
          name: 'Harmony Organic Sculptural Vase',
          category: 'Home Decor',
          collection: 'Earth & Clay',
          priceINR: 3800,
          priceUSD: 45,
          rating: 5.0,
          reviewCount: 41,
          images: [
            'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
          ],
          description: 'An architectural statement piece with biomorphic curved hollows.',
          material: 'Hand-cast Terracotta Clay',
          inStock: true,
          sku: 'SRJ-HD-05',
          colors: [
            { name: 'Chalk White', hex: '#F7F5F0' },
          ],
          sizes: ['Medium (30 cm)'],
          defaultSize: 'Medium (30 cm)',
          careInstructions: 'Wipe with a clean dry cloth.',
          deliveryInfo: 'Dispatched in reinforced custom crate packaging.',
        },
        selectedColor: { name: 'Chalk White', hex: '#F7F5F0' },
        selectedSize: 'Medium (30 cm)',
        quantity: 1,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(['crochet-rose-bouquet']);
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
