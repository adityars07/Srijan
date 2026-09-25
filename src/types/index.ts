export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Crochet' | 'Resin Art' | 'Name Plates' | 'Ceramics & Mugs' | 'Plates & Bowls' | 'Home Decor';
  collection: 'Heritage Resin' | 'Earth & Clay' | 'Boho Blooms' | 'Minimalist Stoneware' | 'Signature Srijan';
  priceINR: number;
  priceUSD: number;
  originalPriceINR?: number;
  originalPriceUSD?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  storySnippet?: string;
  material: string;
  inStock: boolean;
  stockQuantity?: number;
  sku: string;
  colors: ProductColor[];
  sizes: string[];
  defaultSize: string;
  dimensions?: string;
  careInstructions: string;
  deliveryInfo: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  badge?: string;
}

export interface CartItem {
  id: string; // unique item id: productId-color-size
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  productName?: string;
  productImage?: string;
  date: string;
}

export interface FAQItem {
  id: string;
  number: string;
  question: string;
  answer: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  image: string;
  category: string;
}

export type Currency = 'INR' | 'USD';

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  collections: string[];
  materials: string[];
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'newest';
  searchQuery: string;
}
