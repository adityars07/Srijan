import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../config/db.js';

let razorpay: InstanceType<typeof Razorpay> | null = null;

function getRazorpayClient() {
  if (razorpay) return razorpay;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (keyId && keySecret) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('💳 Razorpay client initialized dynamically (Live Mode)');
    return razorpay;
  }
  return null;
}

const MIN_AMOUNT_PAISE = 100;

function respondRazorpayApiError(err: unknown, res: Response): boolean {
  const e = err as {
    statusCode?: number;
    error?: { description?: string };
    message?: string;
  };
  const statusCode = e?.statusCode;
  if (statusCode === 401) {
    res.status(401).json({ error: 'Razorpay authentication failed. Check API keys.' });
    return true;
  }
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    res.status(statusCode).json({
      error: e.error?.description || e.message || 'Razorpay request failed.',
    });
    return true;
  }
  return false;
}

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
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

    if (!shippingAddress) {
      res.status(400).json({ error: 'Shipping address is required.' });
      return;
    }

    // 1. Calculate subtotal securely from database
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }], take: 1 },
        },
      });

      if (!product) {
        res.status(400).json({ error: `Product not found: ${item.productName || item.productId}` });
        return;
      }

      const unitPrice = currency === 'USD' ? product.priceUSD : product.priceINR;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        productImage:
          product.images[0]?.url ||
          (typeof item.productImage === 'string' && !item.productImage.startsWith('data:')
            ? item.productImage
            : '/images/crochet-artisan-floral-bouquet.jpg'),
        colorName: item.colorName || null,
        sizeName: item.sizeName || null,
        unitPrice,
        quantity,
        totalPrice,
      });
    }

    // 2. Validate coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const meetsMin = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
        const underLimit = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;

        if (notExpired && meetsMin && underLimit) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
        }
      }
    }

    // 3. Shipping cost
    const freeShippingThreshold = currency === 'INR' ? 3000 : 50;
    let shippingCost = subtotal >= freeShippingThreshold ? 0 : currency === 'INR' ? 250 : 15;
    if (shippingMethod === 'express') {
      shippingCost += currency === 'INR' ? 150 : 10;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);
    const orderNumber = `SRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const authUser = (req as any).user;
    const userId = authUser?.id || null;

    // 4. Create initial DB order in PENDING status
    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestName: guestInfo?.name || (shippingAddress.firstName ? `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim() : null),
        guestEmail: guestInfo?.email || shippingAddress.email || null,
        guestPhone: guestInfo?.phone || shippingAddress.phone || null,
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        currency,
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: verifiedItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            colorName: item.colorName,
            sizeName: item.sizeName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });

    // 5. Create Razorpay order via Razorpay SDK (paise for INR, cents for USD)
    const amountInSmallestUnit = Math.round(totalAmount * 100);

    if (amountInSmallestUnit < MIN_AMOUNT_PAISE) {
      res.status(400).json({ error: `Minimum payment amount is ${MIN_AMOUNT_PAISE} paise.` });
      return;
    }

    const rzp = getRazorpayClient();
    if (!rzp) {
      res.status(503).json({
        error: 'Razorpay keys not configured on server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server .env.',
      });
      return;
    }

    let razorpayOrder;
    try {
      razorpayOrder = await rzp.orders.create({
        amount: amountInSmallestUnit,
        currency: currency.toUpperCase(),
        receipt: orderNumber,
        notes: {
          dbOrderId: dbOrder.id,
          customerEmail: guestInfo?.email || authUser?.email || '',
          customerName: guestInfo?.name || authUser?.name || '',
        },
      });
    } catch (razorpayErr) {
      if (respondRazorpayApiError(razorpayErr, res)) {
        return;
      }
      throw razorpayErr;
    }

    // 6. Associate razorpayOrderId with DB order
    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.status(201).json({
      order_id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      dbOrderId: dbOrder.id,
      orderNumber,
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment order.' });
  }
};

export const verifyPaymentSignature = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(503).json({ error: 'Razorpay secret key not configured on server.' });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      res.status(400).json({ error: 'Missing payment verification credentials.' });
      return;
    }

    // Cryptographic HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'hex'),
          Buffer.from(razorpay_signature, 'hex')
        );
      } catch {
        return false;
      }
    })();

    if (!isValid) {
      console.error(`❌ Payment signature mismatch for Razorpay order: ${razorpay_order_id}`);
      res.status(400).json({ success: false, error: 'Invalid payment signature.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found in database.' });
      return;
    }

    // Update order to PAID and CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        trackingNumber: order.trackingNumber || `DELHIVERY-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: '3–5 Business Days',
      },
      include: { items: true },
    });

    console.log(`✅ Order ${updatedOrder.orderNumber} successfully paid and confirmed (Razorpay ID: ${razorpay_payment_id})`);

    res.json({
      success: true,
      message: 'Payment verified and order confirmed.',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Payment signature verification error:', err);
    res.status(500).json({ success: false, error: err.message || 'Payment verification failed.' });
  }
};
