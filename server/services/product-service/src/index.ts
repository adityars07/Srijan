import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ service: 'product-service', status: 'healthy', port: PORT });
});

// Product Router
const productRouter = Router();

// GET / or /products - List all products with filtering, search, sorting
productRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      collection,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort,
      isTrending,
      isFeatured,
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = {};

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = { equals: category };
    }

    if (collection && typeof collection === 'string' && collection !== 'All') {
      where.collection = { equals: collection };
    }

    if (minPrice || maxPrice) {
      where.priceINR = {};
      if (minPrice) where.priceINR.gte = parseFloat(minPrice as string);
      if (maxPrice) where.priceINR.lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true') {
      where.inStock = true;
    }

    if (isTrending === 'true') {
      where.isTrending = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { collection: { contains: search } },
      ];
    }

    // Order By
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') {
      orderBy = { priceINR: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { priceINR: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const take = parseInt(limit as string, 10) || 50;
    const skip = ((parseInt(page as string, 10) || 1) - 1) * take;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { orderBy: { order: 'asc' } },
          colors: true,
          sizes: true,
        },
      }),
    ]);

    // Format products for frontend compatibility
    const formattedProducts = products.map((p) => ({
      ...p,
      image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || '',
      images: p.images.map((i) => i.url),
      colors: p.colors.map((c) => ({ name: c.name, hex: c.hex })),
      sizes: p.sizes.map((s) => s.sizeName),
    }));

    res.json({ total, products: formattedProducts });
  } catch (err: any) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /:idOrSlug - Single product
productRouter.get('/:idOrSlug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        colors: true,
        sizes: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const formattedProduct = {
      ...product,
      image: product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || '',
      images: product.images.map((i) => i.url),
      colors: product.colors.map((c) => ({ name: c.name, hex: c.hex })),
      sizes: product.sizes.map((s) => s.sizeName),
    };

    res.json({ product: formattedProduct });
  } catch (err: any) {
    console.error('Fetch single product error:', err);
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// POST / - Create product (Admin)
productRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      category,
      collection,
      priceINR,
      priceUSD,
      originalPriceINR,
      originalPriceUSD,
      description,
      storySnippet,
      material,
      stockQuantity,
      sku,
      dimensions,
      careInstructions,
      deliveryInfo,
      isTrending,
      isFeatured,
      badge,
      images = [],
      colors = [],
      sizes = [],
    } = req.body;

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        category,
        collection: collection || 'Artisanal Essentials',
        priceINR: Number(priceINR),
        priceUSD: Number(priceUSD || Math.round(Number(priceINR) / 83)),
        originalPriceINR: originalPriceINR ? Number(originalPriceINR) : null,
        originalPriceUSD: originalPriceUSD ? Number(originalPriceUSD) : null,
        description,
        storySnippet,
        material: material || 'Handcrafted',
        inStock: stockQuantity ? Number(stockQuantity) > 0 : true,
        stockQuantity: Number(stockQuantity || 10),
        sku: sku || `SRJ-${Date.now().toString().slice(-6)}`,
        dimensions,
        careInstructions: careInstructions || 'Wipe with a clean dry cloth.',
        deliveryInfo: deliveryInfo || 'Crafted on order. Dispatched in 3-4 business days.',
        isTrending: Boolean(isTrending),
        isFeatured: Boolean(isFeatured),
        badge,
        images: {
          create: images.map((url: string, idx: number) => ({
            url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        colors: {
          create: colors.map((c: any) => ({
            name: typeof c === 'string' ? c : c.name,
            hex: typeof c === 'string' ? '#708238' : c.hex || '#708238',
          })),
        },
        sizes: {
          create: sizes.map((s: string) => ({
            sizeName: s,
          })),
        },
      },
      include: {
        images: true,
        colors: true,
        sizes: true,
      },
    });

    res.status(201).json({ message: 'Product created successfully!', product });
  } catch (err: any) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product: ' + (err.message || 'Unknown error') });
  }
});

// PUT /:id - Update product (Admin)
productRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      collection,
      priceINR,
      priceUSD,
      description,
      material,
      stockQuantity,
      isTrending,
      isFeatured,
      badge,
      inStock,
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(collection && { collection }),
        ...(priceINR !== undefined && { priceINR: Number(priceINR) }),
        ...(priceUSD !== undefined && { priceUSD: Number(priceUSD) }),
        ...(description && { description }),
        ...(material && { material }),
        ...(stockQuantity !== undefined && {
          stockQuantity: Number(stockQuantity),
          inStock: Number(stockQuantity) > 0,
        }),
        ...(isTrending !== undefined && { isTrending: Boolean(isTrending) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(badge !== undefined && { badge }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
      },
      include: {
        images: true,
        colors: true,
        sizes: true,
      },
    });

    res.json({ message: 'Product updated successfully!', product: updated });
  } catch (err: any) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /:id - Delete product (Admin)
productRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ================= REVIEWS ROUTER =================
const reviewRouter = Router();

reviewRouter.get('/product/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

reviewRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, authorName, authorLocation, rating, comment, userId } = req.body;
    if (!productId || !authorName || !comment) {
      res.status(400).json({ error: 'Product ID, author name, and comment are required.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        authorName: authorName.trim(),
        authorLocation: authorLocation ? authorLocation.trim() : null,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: comment.trim(),
        userId: userId || null,
        isApproved: true,
      },
    });

    // Update product rating and review count
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((stats._avg.rating || 5) * 10) / 10,
        reviewCount: stats._count.id,
      },
    });

    res.status(201).json({ message: 'Review submitted successfully!', review });
  } catch (err: any) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// ================= INTERNAL INTER-SERVICE ENDPOINTS =================
app.post('/internal/stock-check', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Items array is required.' });
      return;
    }

    const checks: any[] = [];
    let allAvailable = true;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        checks.push({ productId: item.productId, available: false, reason: 'Product not found' });
        allAvailable = false;
      } else if (!product.inStock || product.stockQuantity < (item.quantity || 1)) {
        checks.push({
          productId: item.productId,
          productName: product.name,
          available: false,
          availableStock: product.stockQuantity,
          requested: item.quantity || 1,
        });
        allAvailable = false;
      } else {
        checks.push({
          productId: item.productId,
          productName: product.name,
          available: true,
          priceINR: product.priceINR,
          priceUSD: product.priceUSD,
        });
      }
    }

    res.json({ available: allAvailable, items: checks });
  } catch (err: any) {
    console.error('Internal stock check error:', err);
    res.status(500).json({ error: 'Internal stock check failed.' });
  }
});

app.post('/internal/decrement-stock', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Items array is required.' });
      return;
    }

    const updated = [];
    for (const item of items) {
      const qty = item.quantity || 1;
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const newStock = Math.max(0, product.stockQuantity - qty);
        const up = await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStock,
            inStock: newStock > 0,
          },
        });
        updated.push({ productId: up.id, remainingStock: up.stockQuantity, inStock: up.inStock });
      }
    }

    res.json({ success: true, updated });
  } catch (err: any) {
    console.error('Internal decrement stock error:', err);
    res.status(500).json({ error: 'Stock decrement failed.' });
  }
});

// Product metrics for admin aggregation
app.get('/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalProducts, outOfStock, categories] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { inStock: false } }),
      prisma.product.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
    ]);

    res.json({
      totalProducts,
      outOfStock,
      categoriesCount: categories.length,
      categoryBreakdown: categories,
    });
  } catch (err: any) {
    console.error('Product metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch product metrics.' });
  }
});

// Mount routers to support both direct and gateway paths
app.use('/products', productRouter);
app.use('/reviews', reviewRouter);
app.use('/', productRouter);

app.listen(PORT, () => {
  console.log(`🛍️ Product Service running on port ${PORT}`);
});
