import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import customRequestRoutes from './routes/customRequest.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import reviewRoutes from './routes/review.routes.js';
import contactRoutes from './routes/contact.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import { createPaymentOrder, verifyPaymentSignature } from './controllers/payment.controller.js';
import { optionalAuth } from './middlewares/auth.js';
import { prisma } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — Dynamic CORS for production + local dev
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://srijan-handmadebyrakhi.com',
  'https://www.srijan-handmadebyrakhi.com',
  'http://srijan-handmadebyrakhi.com',
  'http://www.srijan-handmadebyrakhi.com',
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||  // Allow all Vercel preview deploys
      origin.endsWith('srijan-handmadebyrakhi.com')  // Custom domain
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Serve static images from parent public/images if needed
app.use('/images', express.static(path.join(__dirname, '../../public/images')));

// API Health Check (supports root /, /health, and /api/health)
app.get(['/', '/health', '/api/health'], async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err?.message || 'Database connection failed';
  }

  res.json({
    status: 'online',
    service: 'Srijan Artisanal API',
    database: dbStatus,
    ...(dbError && { error: dbError }),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Razorpay Standard Checkout (documentation-style paths)
app.post('/api/create-order', optionalAuth, createPaymentOrder);
app.post('/api/verify-payment', verifyPaymentSignature);

// Global 404 handler for API
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`✨ Srijan Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
