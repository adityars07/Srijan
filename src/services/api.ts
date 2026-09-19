// Central API service connecting React to Node.js/Express backend

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('srijan_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: any; token: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { name: string; email: string; password: string; phone?: string }) =>
      request<{ user: any; token: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<{ user: any }>('/auth/me'),
  },

  // Products
  products: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const qStr = query.toString();
      return request<{ total: number; products: any[] }>(`/products${qStr ? `?${qStr}` : ''}`);
    },
    getByIdOrSlug: (idOrSlug: string) =>
      request<{ product: any }>(`/products/${idOrSlug}`),
    create: (productData: any) =>
      request<{ message: string; product: any }>('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
    update: (id: string, productData: any) =>
      request<{ message: string; product: any }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders & Tracking
  orders: {
    create: (orderData: any) =>
      request<{ message: string; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    track: (orderNumberOrTracking: string) =>
      request<{ order: any }>(`/orders/track/${encodeURIComponent(orderNumberOrTracking)}`),
    getMyOrders: () =>
      request<{ orders: any[] }>('/orders/my-orders'),
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<{ total: number; orders: any[] }>(`/orders${query ? `?${query}` : ''}`);
    },
    updateStatus: (id: string, updateData: { status?: string; trackingNumber?: string; notes?: string }) =>
      request<{ message: string; order: any }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }),
  },

  // Custom Bespoke Commissions
  customRequests: {
    create: (requestData: any) =>
      request<{ message: string; customRequest: any }>('/custom-requests', {
        method: 'POST',
        body: JSON.stringify(requestData),
      }),
    getAll: () =>
      request<{ total: number; requests: any[] }>('/custom-requests'),
    update: (id: string, data: any) =>
      request<{ message: string; customRequest: any }>(`/custom-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Coupons
  coupons: {
    validate: (code: string, subtotal: number) =>
      request<{ valid: boolean; coupon: { code: string; discountType: string; discountValue: number; discountAmount: number } }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
    getAll: () =>
      request<{ coupons: any[] }>('/coupons'),
    create: (couponData: any) =>
      request<{ message: string; coupon: any }>('/coupons', {
        method: 'POST',
        body: JSON.stringify(couponData),
      }),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) =>
      request<{ reviews: any[] }>(`/reviews/product/${productId}`),
    submit: (reviewData: any) =>
      request<{ message: string; review: any }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
  },

  // Contact & Inquiries
  contact: {
    submit: (messageData: { name: string; email: string; phone?: string; message: string }) =>
      request<{ message: string; contact: any }>('/contact', {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),
    getAll: () =>
      request<{ messages: any[] }>('/contact'),
    markRead: (id: string) =>
      request<{ message: string; contact: any }>(`/contact/${id}/read`, {
        method: 'PATCH',
      }),
  },

  // Admin Metrics
  admin: {
    getMetrics: () =>
      request<{ metrics: any; recentOrders: any[]; recentRequests: any[] }>('/admin/metrics'),
  },
};
