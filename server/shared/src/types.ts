export interface AuthUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name?: string;
}

export interface ProductStockCheckResult {
  productId: string;
  available: boolean;
  currentStock: number;
  unitPriceINR: number;
  unitPriceUSD: number;
  name: string;
  primaryImage: string;
}

export interface StockDecrementItem {
  productId: string;
  quantity: number;
}
