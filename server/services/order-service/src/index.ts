import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'srijan_artisan_secret_key_2026_super_secure_jwt';

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper to extract user from optional Bearer token
function getAuthUser(req: Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ service: 'order-service', status: 'healthy', port: PORT });
});

// ================= COUPONS ROUTER =================
const couponRouter = Router();

// POST /coupons/validate or /validate
couponRouter.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Coupon code is required.' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({ valid: false, error: 'Invalid or inactive coupon code.' });
      return;
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      res.status(400).json({
        valid: false,
        error: `Coupon requires a minimum order value of ₹${coupon.minOrderValue}.`,
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (err: any) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

// GET /coupons or /
couponRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ coupons });
  } catch (err: any) {
    console.error('Get coupons error:', err);
    res.status(500).json({ error: 'Failed to retrieve coupons.' });
  }
});

// POST /coupons or /
couponRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, maxUsage } = req.body;
    if (!code || !discountValue) {
      res.status(400).json({ error: 'Coupon code and discount value are required.' });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        isActive: true,
      },
    });

    res.status(201).json({ message: 'Coupon created successfully!', coupon });
  } catch (err: any) {
    console.error('Create coupon error:', err);
    res.status(500).json({ error: 'Failed to create coupon: ' + (err.message || '') });
  }
});

// ================= ORDERS ROUTER =================
const orderRouter = Router();

// POST /orders or / - Place new order
orderRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'UPI',
      couponCode,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    // 1. Inter-Service stock check with Product Service
    try {
      const stockRes = await fetch(`${PRODUCT_SERVICE_URL}/internal/stock-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity || 1,
          })),
        }),
      });

      if (stockRes.ok) {
        const stockData: any = await stockRes.json();
        if (!stockData.available) {
          res.status(400).json({
            error: 'One or more items in your cart are currently out of stock.',
            stockDetails: stockData.items,
          });
          return;
        }
      }
    } catch (interError) {
      console.warn('⚠️ Product service stock check skipped/failed:', interError);
    }

    // 2. Calculate Subtotal
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
      0
    );

    // 3. Process Coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    const shippingCost = subtotal > 1500 ? 0 : 99;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

    // 4. Generate Identifiers
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SRJ-${new Date().getFullYear()}-${randomSuffix}`;
    const trackingNumber = `DELHIVERY-${Math.floor(100000 + Math.random() * 900000)}`;

    const authUser = getAuthUser(req);
    const userId = authUser?.id || null;

    // 5. Create Order & Items
    const addressStr =
      typeof shippingAddress === 'string'
        ? shippingAddress
        : JSON.stringify(shippingAddress || {});

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestName: guestName || authUser?.name || 'Artisan Patron',
        guestEmail: guestEmail || authUser?.email || 'patron@srijan.com',
        guestPhone: guestPhone || null,
        subtotal,
        discountAmount: Math.round(discountAmount),
        shippingCost,
        totalAmount: Math.round(totalAmount),
        currency: 'INR',
        status: 'CONFIRMED',
        paymentMethod,
        paymentStatus: 'PAID',
        shippingAddress: addressStr,
        trackingNumber,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || item.name || 'Artisan Craft',
            productImage: item.productImage || item.image || null,
            colorName: item.colorName || null,
            sizeName: item.sizeName || null,
            unitPrice: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 1,
            totalPrice: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 6. Inter-service call to decrement stock in Product Service
    try {
      await fetch(`${PRODUCT_SERVICE_URL}/internal/decrement-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity || 1,
          })),
        }),
      });
    } catch (stockDecErr) {
      console.warn('⚠️ Product service stock decrement error:', stockDecErr);
    }

    res.status(201).json({
      message: 'Order placed successfully! Your handcrafted items are being prepared.',
      order,
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to place order: ' + (err.message || '') });
  }
});

// GET /orders/track/:orderNumberOrTracking or /track/:orderNumberOrTracking
orderRouter.get('/track/:orderNumberOrTracking', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumberOrTracking } = req.params;
    const query = decodeURIComponent(orderNumberOrTracking).trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: query } },
          { trackingNumber: { equals: query } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found with provided tracking or order number.' });
      return;
    }

    res.json({ order });
  } catch (err: any) {
    console.error('Track order error:', err);
    res.status(500).json({ error: 'Failed to track order.' });
  }
});

// GET /orders/my-orders or /my-orders
orderRouter.get('/my-orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Authentication required to view order history.' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: authUser.id },
          { guestEmail: authUser.email },
        ],
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (err: any) {
    console.error('Get my-orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

// GET /orders or / - All orders
orderRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search } },
        { trackingNumber: { contains: search } },
        { guestName: { contains: search } },
        { guestEmail: { contains: search } },
      ];
    }

    const take = parseInt(limit as string, 10) || 50;
    const skip = ((parseInt(page as string, 10) || 1) - 1) * take;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        take,
        skip,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ total, orders });
  } catch (err: any) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// PATCH /orders/:id/status or /:id/status
orderRouter.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes, paymentStatus } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber && { trackingNumber }),
        ...(notes !== undefined && { notes }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { items: true },
    });

    res.json({ message: 'Order status updated successfully!', order: updated });
  } catch (err: any) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// GET /metrics - Order metrics for admin dashboard
app.get('/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalOrders, revenueData, pendingOrders, completedOrders, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { paymentStatus: 'PAID' },
        }),
        prisma.order.count({
          where: { status: { in: ['CONFIRMED', 'IN_CRAFTING'] } },
        }),
        prisma.order.count({
          where: { status: 'DELIVERED' },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        }),
      ]);

    res.json({
      totalOrders,
      totalRevenue: revenueData._sum.totalAmount || 0,
      pendingOrders,
      completedOrders,
      recentOrders,
    });
  } catch (err: any) {
    console.error('Order metrics error:', err);
    res.status(500).json({ error: 'Failed to retrieve order metrics.' });
  }
});

// Mount routers to support both direct and gateway proxied routes
app.use('/orders', orderRouter);
app.use('/coupons', couponRouter);
app.use('/', orderRouter);

app.listen(PORT, () => {
  console.log(`📦 Order Service running on port ${PORT}`);
});
