import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Promo code is required.' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({ error: 'Invalid or expired promo code.' });
      return;
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ error: 'This promo code has expired.' });
      return;
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      res.status(400).json({
        error: `Minimum order value for code ${coupon.code} is ₹${coupon.minOrderValue}.`,
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ error: 'Failed to validate promo code.' });
  }
};

export const getAllCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ coupons });
  } catch (err: any) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType = 'PERCENTAGE', discountValue, minOrderValue, maxDiscount, expiresAt } = req.body;

    if (!code || !discountValue) {
      res.status(400).json({ error: 'Code and discountValue are required.' });
      return;
    }

    const created = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({ message: 'Coupon created!', coupon: created });
  } catch (err: any) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ error: 'Failed to create coupon.' });
  }
};
