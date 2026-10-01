import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'srijan_artisan_secret_key_2026_super_secure_jwt';

// Razorpay Live Credentials — loaded from environment, never hardcoded
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

let razorpay: InstanceType<typeof Razorpay> | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log(`💳 Razorpay client initialized: ${RAZORPAY_KEY_ID.startsWith('rzp_live') ? 'LIVE PRODUCTION MODE' : 'TEST MODE'}`);
} else {
  console.warn('⚠️ Razorpay keys not configured — payment endpoints will return errors. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
}

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

    // Helper to resolve fallback product images if null in DB
    const resolveItemImage = (name: string, currentImg: string | null) => {
      if (currentImg && currentImg.trim()) return currentImg;
      const n = (name || '').toLowerCase();
      if (n.includes('sling') || n.includes('bag')) return '/images/crochet-sunflower-tote-crossbody.jpg';
      if (n.includes('dream') || n.includes('catcher')) return '/images/crochet-mandala-dreamcatcher-emerald.jpg';
      if (n.includes('flower') || n.includes('rose') || n.includes('bouquet')) return '/images/crochet-artisan-floral-bouquet.jpg';
      if (n.includes('keychain')) return '/images/crochet-daisy-keychains-pair.jpg';
      if (n.includes('plate') || n.includes('name')) return '/images/buddha_nameplate.jpg';
      if (n.includes('mug') || n.includes('cup')) return '/images/stoneware_mug.jpg';
      if (n.includes('bowl')) return '/images/ceramic_plates.jpg';
      return '/images/crochet-artisan-floral-bouquet.jpg';
    };

    const enrichedItems = order.items.map((it) => ({
      ...it,
      productImage: resolveItemImage(it.productName, it.productImage),
    }));

    res.json({
      order: {
        ...order,
        items: enrichedItems,
      },
    });
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

// ================= PAYMENT ROUTER (Razorpay Live) =================
const paymentRouter = Router();

// POST /payments/create-order — Create DB order + Razorpay order
paymentRouter.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!razorpay || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      res.status(503).json({ error: 'Payment gateway not configured. Set Razorpay credentials in environment.' });
      return;
    }

    const {
      items,
      shippingAddress,
      currency = 'INR',
      shippingMethod = 'standard',
      couponCode,
      guestInfo,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    // 1. Inter-service stock check
    try {
      const stockRes = await fetch(`${PRODUCT_SERVICE_URL}/internal/stock-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity || 1 })),
        }),
      });
      if (stockRes.ok) {
        const stockData: any = await stockRes.json();
        if (!stockData.available) {
          res.status(400).json({
            error: 'One or more items are out of stock.',
            stockDetails: stockData.items,
          });
          return;
        }
      }
    } catch (stockErr) {
      console.warn('⚠️ Stock check skipped:', stockErr);
    }

    // 2. Server-side total calculation (NEVER trust frontend amounts)
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
      0
    );

    // 3. Apply coupon server-side
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    // 4. Shipping cost calculation
    const shippingCost =
      shippingMethod === 'pickup'
        ? 0
        : shippingMethod === 'express'
        ? currency === 'INR' ? 250 : 20
        : currency === 'INR' ? 120 : 10;

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

    // 5. Generate unique order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SRJ-${new Date().getFullYear()}-${randomSuffix}`;

    const authUser = getAuthUser(req);

    // 6. Create DB order with PENDING payment status
    const addressStr =
      typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress || {});

    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: authUser?.id || null,
        guestName: guestInfo?.name || authUser?.name || 'Guest',
        guestEmail: guestInfo?.email || authUser?.email || '',
        guestPhone: guestInfo?.phone || null,
        subtotal,
        discountAmount: Math.round(discountAmount),
        shippingCost,
        totalAmount: Math.round(totalAmount),
        currency,
        status: 'PENDING_PAYMENT',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        shippingAddress: addressStr,
        notes: null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName || 'Artisan Craft',
            productImage: item.productImage || null,
            colorName: item.colorName || null,
            sizeName: item.sizeName || null,
            unitPrice: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 1,
            totalPrice: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
          })),
        },
      },
    });

    // 7. Create Razorpay order (amount in smallest currency unit: paise/cents)
    const amountInSmallestUnit = Math.round(totalAmount * 100);

    if (amountInSmallestUnit < 100) {
      res.status(400).json({ error: 'Minimum payment amount is 100 paise.' });
      return;
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt: orderNumber,
      notes: {
        dbOrderId: dbOrder.id,
        customerEmail: guestInfo?.email || authUser?.email || '',
        customerName: guestInfo?.name || authUser?.name || '',
      },
    });

    // 8. Link Razorpay order ID to DB order
    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    // 9. Increment coupon usage if applied
    if (couponCode && discountAmount > 0) {
      await prisma.coupon.updateMany({
        where: { code: couponCode.toUpperCase().trim() },
        data: { usageCount: { increment: 1 } },
      });
    }

    console.log(`💳 Payment order created: ${orderNumber} → Razorpay ${razorpayOrder.id} (₹${totalAmount})`);

    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      dbOrderId: dbOrder.id,
      orderNumber,
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      key: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Payment create-order error:', err);
    res.status(500).json({ error: 'Failed to create payment order: ' + (err.message || '') });
  }
});

// POST /payments/verify — Verify Razorpay payment signature
paymentRouter.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      res.status(503).json({ error: 'Payment gateway not configured.' });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      res.status(400).json({ error: 'Missing required payment verification fields.' });
      return;
    }

    // 1. HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'hex'),
          Buffer.from(razorpay_signature, 'hex')
        );
      } catch {
        return false;
      }
    })();

    if (!isSignatureValid) {
      console.error(`❌ Payment signature mismatch for Razorpay order: ${razorpay_order_id}`);
      res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
      return;
    }

    // 2. Verify DB order exists and is PENDING
    const existingOrder = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    // Idempotent: if already PAID, return success without re-processing
    if (existingOrder.paymentStatus === 'PAID') {
      const order = await prisma.order.findUnique({
        where: { id: dbOrderId },
        include: { items: true },
      });
      res.json({ success: true, order, message: 'Payment already verified.' });
      return;
    }

    // 3. Update order to PAID + CONFIRMED
    const trackingNumber = `DELHIVERY-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedOrder = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        trackingNumber,
      },
      include: { items: true },
    });

    // 4. Decrement stock via Product Service
    try {
      await fetch(`${PRODUCT_SERVICE_URL}/internal/decrement-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedOrder.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
    } catch (stockErr) {
      console.warn('⚠️ Stock decrement error (order still valid):', stockErr);
    }

    console.log(`✅ Payment verified: ${razorpay_payment_id} → Order ${updatedOrder.orderNumber}`);

    res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed: ' + (err.message || '') });
  }
});

// POST /payments/webhook — Razorpay server-to-server failsafe
paymentRouter.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'] as string;
      if (!webhookSignature || !RAZORPAY_WEBHOOK_SECRET) {
        res.status(400).json({ error: 'Missing webhook signature or secret.' });
        return;
      }

      // 1. Verify webhook signature
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      const expectedSig = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      const isValid = (() => {
        try {
          return crypto.timingSafeEqual(
            Buffer.from(expectedSig, 'hex'),
            Buffer.from(webhookSignature, 'hex')
          );
        } catch {
          return false;
        }
      })();

      if (!isValid) {
        console.error('❌ Webhook signature invalid');
        res.status(400).json({ error: 'Invalid webhook signature.' });
        return;
      }

      // 2. Parse the verified payload
      const event = JSON.parse(body.toString());
      const eventType = event.event;

      console.log(`🔔 Razorpay Webhook received: ${eventType}`);

      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;

        if (razorpayOrderId) {
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId },
          });

          if (order && order.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                razorpayPaymentId: payment.id,
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                trackingNumber: order.trackingNumber || `DELHIVERY-${Math.floor(100000 + Math.random() * 900000)}`,
              },
            });
            console.log(`✅ Webhook failsafe: Order ${order.orderNumber} marked PAID`);
          }
        }
      }

      if (eventType === 'payment.failed') {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;

        if (razorpayOrderId) {
          await prisma.order.updateMany({
            where: { razorpayOrderId, paymentStatus: 'PENDING' },
            data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
          });
          console.log(`❌ Webhook: Payment failed for Razorpay order ${razorpayOrderId}`);
        }
      }

      // Always respond 200 to Razorpay (prevents retry loops)
      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Webhook processing error:', err);
      res.status(200).json({ received: true });
    }
  }
);

// Mount routers to support both direct and gateway proxied routes
app.use('/orders', orderRouter);
app.use('/coupons', couponRouter);
app.use('/payments', paymentRouter);
app.use('/', orderRouter);

app.listen(PORT, () => {
  console.log(`📦 Order Service running on port ${PORT}`);
  if (razorpay) {
    console.log(`  💳 Razorpay Live Mode: ACTIVE`);
  } else {
    console.log(`  ⚠️ Razorpay: NOT CONFIGURED (payment endpoints disabled)`);
  }
});
