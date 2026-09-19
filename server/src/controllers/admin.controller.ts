import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getAdminMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      orders,
      totalProducts,
      lowStockProducts,
      pendingCustomRequests,
      unreadMessages,
      recentOrders,
      recentRequests,
    ] = await Promise.all([
      prisma.order.findMany({ select: { totalAmount: true, currency: true, status: true } }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 15 } },
        select: { id: true, name: true, stockQuantity: true, sku: true },
      }),
      prisma.customCommission.count({
        where: { status: { in: ['INQUIRY_RECEIVED', 'REVIEWING', 'QUOTE_SENT', 'IN_CRAFTING'] } },
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.customCommission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let totalRevenueINR = 0;
    let totalRevenueUSD = 0;
    const orderStatusCounts: Record<string, number> = {
      CONFIRMED: 0,
      IN_CRAFTING: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orders.forEach((o) => {
      if (o.currency === 'USD') {
        totalRevenueUSD += o.totalAmount;
      } else {
        totalRevenueINR += o.totalAmount;
      }
      if (orderStatusCounts[o.status] !== undefined) {
        orderStatusCounts[o.status]++;
      }
    });

    res.json({
      metrics: {
        totalRevenueINR,
        totalRevenueUSD,
        totalOrders: orders.length,
        orderStatusCounts,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        pendingCustomRequests,
        unreadMessages,
      },
      recentOrders: recentOrders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress),
      })),
      recentRequests: recentRequests.map((r) => ({
        ...r,
        referenceImages: r.referenceImages ? JSON.parse(r.referenceImages) : [],
      })),
    });
  } catch (err: any) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard metrics.' });
  }
};
