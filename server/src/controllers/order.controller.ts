import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      items,
      shippingAddress,
      currency = 'INR',
      shippingMethod = 'standard',
      paymentMethod = 'UPI',
      couponCode,
      notes,
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

    // 1. Calculate subtotal and verify products
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
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
        productImage: item.productImage || '/images/crochet-artisan-floral-bouquet.jpg',
        colorName: item.colorName || null,
        sizeName: item.sizeName || null,
        unitPrice,
        quantity,
        totalPrice,
      });

      // Reduce product stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: Math.max(0, product.stockQuantity - quantity),
          inStock: product.stockQuantity - quantity > 0,
        },
      });
    }

    // 2. Validate coupon if provided
    let discountAmount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = Math.min(subtotal, coupon.discountValue);
          }

          // Update usage count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: coupon.usageCount + 1 },
          });
        }
      }
    }

    // 3. Calculate shipping cost
    let shippingCost = 0;
    if (shippingMethod === 'express') {
      shippingCost = currency === 'USD' ? 20 : 250;
    } else if (shippingMethod === 'standard') {
      shippingCost = subtotal > (currency === 'USD' ? 50 : 2000) ? 0 : currency === 'USD' ? 10 : 120;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

    // 4. Generate unique Order Number & Tracking Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SRJ-2026-${randomSuffix}`;
    const trackingNumber = `SRJ-EXP-${Math.floor(100000 + Math.random() * 900000)}`;

    const userId = req.user?.id || null;
    const guestEmail = guestInfo?.email || (typeof shippingAddress === 'object' ? shippingAddress.email : null);
    const guestName = guestInfo?.name || (typeof shippingAddress === 'object' ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() : null);
    const guestPhone = guestInfo?.phone || (typeof shippingAddress === 'object' ? shippingAddress.phone : null);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        guestName,
        guestPhone,
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        currency,
        status: 'CONFIRMED',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        trackingNumber,
        notes: notes || null,
        items: {
          create: verifiedItems,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddress),
      },
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to place order: ' + (err.message || 'Server error') });
  }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumberOrTracking } = req.params;
    const search = orderNumberOrTracking.trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: search } },
          { trackingNumber: { equals: search } },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found. Please verify your order number or tracking ID.' });
      return;
    }

    res.json({
      order: {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddress),
      },
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    res.status(500).json({ error: 'Failed to retrieve order tracking information.' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    res.json({
      orders: orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: 'Failed to fetch your orders.' });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = '50' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
      include: { items: true },
    });

    res.json({
      total: orders.length,
      orders: orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, paymentStatus, notes } = req.body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    res.json({
      message: 'Order status updated successfully!',
      order: {
        ...updated,
        shippingAddress: JSON.parse(updated.shippingAddress),
      },
    });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};
