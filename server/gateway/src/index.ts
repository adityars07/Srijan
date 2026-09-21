import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';
const COMMISSION_SERVICE_URL = process.env.COMMISSION_SERVICE_URL || 'http://localhost:5004';

app.use(cors());

// ================= GATEWAY AGGREGATOR ROUTES (BEFORE PROXY) =================
// GET /api/health - Unified health dashboard
app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
  const checkService = async (name: string, url: string) => {
    try {
      const resp = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
      const data = await resp.json();
      return { service: name, status: 'online', details: data };
    } catch {
      return { service: name, status: 'offline', error: 'Service unreachable' };
    }
  };

  const [auth, product, order, commission] = await Promise.all([
    checkService('auth-service', AUTH_SERVICE_URL),
    checkService('product-service', PRODUCT_SERVICE_URL),
    checkService('order-service', ORDER_SERVICE_URL),
    checkService('commission-service', COMMISSION_SERVICE_URL),
  ]);

  const allOnline = [auth, product, order, commission].every((s) => s.status === 'online');

  res.status(allOnline ? 200 : 207).json({
    gateway: 'srijan-api-gateway',
    status: allOnline ? 'healthy' : 'degraded',
    port: PORT,
    timestamp: new Date().toISOString(),
    services: {
      auth,
      product,
      order,
      commission,
    },
  });
});

// GET /api/admin/metrics - Microservices Metrics Aggregator
app.get('/api/admin/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [prodRes, orderRes, commRes] = await Promise.allSettled([
      fetch(`${PRODUCT_SERVICE_URL}/metrics`).then((r) => r.json()),
      fetch(`${ORDER_SERVICE_URL}/metrics`).then((r) => r.json()),
      fetch(`${COMMISSION_SERVICE_URL}/metrics`).then((r) => r.json()),
    ]);

    const productData =
      prodRes.status === 'fulfilled' ? (prodRes.value as any) : { totalProducts: 0, outOfStock: 0 };
    const orderData =
      orderRes.status === 'fulfilled'
        ? (orderRes.value as any)
        : { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0, recentOrders: [] };
    const commData =
      commRes.status === 'fulfilled'
        ? (commRes.value as any)
        : {
            totalCommissions: 0,
            pendingCommissions: 0,
            totalMessages: 0,
            unreadMessages: 0,
            recentRequests: [],
          };

    res.json({
      metrics: {
        totalProducts: productData.totalProducts || 0,
        outOfStock: productData.outOfStock || 0,
        totalOrders: orderData.totalOrders || 0,
        totalRevenue: orderData.totalRevenue || 0,
        pendingOrders: orderData.pendingOrders || 0,
        completedOrders: orderData.completedOrders || 0,
        totalCommissions: commData.totalCommissions || 0,
        pendingCommissions: commData.pendingCommissions || 0,
        totalMessages: commData.totalMessages || 0,
        unreadMessages: commData.unreadMessages || 0,
      },
      recentOrders: orderData.recentOrders || [],
      recentRequests: commData.recentRequests || [],
    });
  } catch (err: any) {
    console.error('Gateway metrics aggregator error:', err);
    res.status(500).json({ error: 'Failed to aggregate admin metrics across services.' });
  }
});

// ================= MICROSERVICES PROXY ROUTES =================
// 1. Auth Service (Port 5001)
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

// 2. Product & Review Service (Port 5002)
app.use(
  '/api/products',
  createProxyMiddleware({
    target: PRODUCT_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/api/reviews',
  createProxyMiddleware({
    target: `${PRODUCT_SERVICE_URL}/reviews`,
    changeOrigin: true,
  })
);

// 3. Order & Coupon Service (Port 5003)
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/api/coupons',
  createProxyMiddleware({
    target: `${ORDER_SERVICE_URL}/coupons`,
    changeOrigin: true,
  })
);

// 4. Commission & Contact Service (Port 5004)
app.use(
  '/api/custom-requests',
  createProxyMiddleware({
    target: COMMISSION_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/api/contact',
  createProxyMiddleware({
    target: `${COMMISSION_SERVICE_URL}/contact`,
    changeOrigin: true,
  })
);

// Fallback 404 for unknown gateway paths
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Gateway route not found.',
    availableEndpoints: [
      '/api/auth/*',
      '/api/products/*',
      '/api/reviews/*',
      '/api/orders/*',
      '/api/coupons/*',
      '/api/custom-requests/*',
      '/api/contact/*',
      '/api/admin/metrics',
      '/api/health',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Srijan API Gateway running on http://localhost:${PORT}`);
  console.log(`  ├── /api/auth            -> ${AUTH_SERVICE_URL}`);
  console.log(`  ├── /api/products        -> ${PRODUCT_SERVICE_URL}`);
  console.log(`  ├── /api/reviews         -> ${PRODUCT_SERVICE_URL}/reviews`);
  console.log(`  ├── /api/orders          -> ${ORDER_SERVICE_URL}`);
  console.log(`  ├── /api/coupons         -> ${ORDER_SERVICE_URL}/coupons`);
  console.log(`  ├── /api/custom-requests -> ${COMMISSION_SERVICE_URL}`);
  console.log(`  └── /api/contact         -> ${COMMISSION_SERVICE_URL}/contact`);
});
