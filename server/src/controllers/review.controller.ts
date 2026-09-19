import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, authorName, authorLocation, rating, comment } = req.body;

    if (!productId || !authorName || !rating || !comment) {
      res.status(400).json({ error: 'Product ID, author name, rating, and comment are required.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user?.id || null,
        authorName: authorName.trim(),
        authorLocation: authorLocation ? authorLocation.trim() : null,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment.trim(),
        isApproved: true,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
    });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    res.status(201).json({ message: 'Review posted successfully!', review });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });
    res.json({ reviews });
  } catch (err: any) {
    console.error('Error fetching admin reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};
