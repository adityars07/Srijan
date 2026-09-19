import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      collection,
      minPrice,
      maxPrice,
      currency = 'INR',
      search,
      isTrending,
      isFeatured,
      sortBy = 'popular',
    } = req.query;

    const where: any = {};

    if (category && typeof category === 'string' && category !== 'all') {
      where.category = { equals: category };
    }

    if (collection && typeof collection === 'string') {
      where.collection = { equals: collection };
    }

    if (isTrending === 'true') {
      where.isTrending = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { collection: { contains: search } },
        { material: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceField = currency === 'USD' ? 'priceUSD' : 'priceINR';
      where[priceField] = {};
      if (minPrice) where[priceField].gte = parseFloat(minPrice as string);
      if (maxPrice) where[priceField].lte = parseFloat(maxPrice as string);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = currency === 'USD' ? { priceUSD: 'asc' } : { priceINR: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = currency === 'USD' ? { priceUSD: 'desc' } : { priceINR: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'popular') {
      orderBy = [{ isFeatured: 'desc' }, { reviewCount: 'desc' }];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        images: { orderBy: { order: 'asc' } },
        colors: true,
        sizes: true,
      },
    });

    // Format output with convenient image array
    const formatted = products.map((p) => ({
      ...p,
      images: p.images.length > 0 ? p.images.map((img) => img.url) : ['/images/crochet-artisan-floral-bouquet.jpg'],
      colors: p.colors.map((c) => ({ name: c.name, hex: c.hex })),
      sizes: p.sizes.map((s) => s.sizeName),
      defaultSize: p.sizes.length > 0 ? p.sizes[0].sizeName : 'Standard',
    }));

    res.json({
      total: formatted.length,
      products: formatted,
    });
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

export const getProductBySlugOrId = async (req: Request, res: Response): Promise<void> => {
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

    const formatted = {
      ...product,
      images: product.images.length > 0 ? product.images.map((img) => img.url) : [],
      colors: product.colors.map((c) => ({ name: c.name, hex: c.hex })),
      sizes: product.sizes.map((s) => s.sizeName),
      defaultSize: product.sizes.length > 0 ? product.sizes[0].sizeName : 'Standard',
    };

    res.json({ product: formatted });
  } catch (err: any) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
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
      stockQuantity = 20,
      sku,
      dimensions,
      careInstructions,
      deliveryInfo,
      isTrending = false,
      isFeatured = false,
      badge,
      images = [],
      colors = [],
      sizes = [],
    } = req.body;

    if (!name || !category || !priceINR || !priceUSD || !material || !sku) {
      res.status(400).json({ error: 'Missing required product fields.' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const created = await prisma.product.create({
      data: {
        slug,
        name,
        category,
        collection: collection || 'Signature Srijan',
        priceINR: parseFloat(priceINR),
        priceUSD: parseFloat(priceUSD),
        originalPriceINR: originalPriceINR ? parseFloat(originalPriceINR) : null,
        originalPriceUSD: originalPriceUSD ? parseFloat(originalPriceUSD) : null,
        description: description || '',
        storySnippet: storySnippet || null,
        material,
        stockQuantity: parseInt(stockQuantity, 10),
        inStock: parseInt(stockQuantity, 10) > 0,
        sku,
        dimensions: dimensions || null,
        careInstructions: careInstructions || 'Gently dust with a soft cloth.',
        deliveryInfo: deliveryInfo || 'Crafted on order. Dispatched in 3-4 days.',
        isTrending: Boolean(isTrending),
        isFeatured: Boolean(isFeatured),
        badge: badge || null,
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
            hex: typeof c === 'string' ? '#333333' : c.hex || '#333333',
          })),
        },
        sizes: {
          create: sizes.map((s: any) => ({
            sizeName: typeof s === 'string' ? s : s.sizeName,
          })),
        },
      },
      include: {
        images: true,
        colors: true,
        sizes: true,
      },
    });

    res.status(201).json({
      message: 'Product created successfully!',
      product: created,
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product: ' + (err.message || 'Server error') });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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
      inStock,
      sku,
      dimensions,
      careInstructions,
      deliveryInfo,
      isTrending,
      isFeatured,
      badge,
    } = req.body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (category !== undefined) dataToUpdate.category = category;
    if (collection !== undefined) dataToUpdate.collection = collection;
    if (priceINR !== undefined) dataToUpdate.priceINR = parseFloat(priceINR);
    if (priceUSD !== undefined) dataToUpdate.priceUSD = parseFloat(priceUSD);
    if (originalPriceINR !== undefined) dataToUpdate.originalPriceINR = originalPriceINR ? parseFloat(originalPriceINR) : null;
    if (originalPriceUSD !== undefined) dataToUpdate.originalPriceUSD = originalPriceUSD ? parseFloat(originalPriceUSD) : null;
    if (description !== undefined) dataToUpdate.description = description;
    if (storySnippet !== undefined) dataToUpdate.storySnippet = storySnippet;
    if (material !== undefined) dataToUpdate.material = material;
    if (stockQuantity !== undefined) {
      dataToUpdate.stockQuantity = parseInt(stockQuantity, 10);
      dataToUpdate.inStock = parseInt(stockQuantity, 10) > 0;
    }
    if (inStock !== undefined) dataToUpdate.inStock = Boolean(inStock);
    if (sku !== undefined) dataToUpdate.sku = sku;
    if (dimensions !== undefined) dataToUpdate.dimensions = dimensions;
    if (careInstructions !== undefined) dataToUpdate.careInstructions = careInstructions;
    if (deliveryInfo !== undefined) dataToUpdate.deliveryInfo = deliveryInfo;
    if (isTrending !== undefined) dataToUpdate.isTrending = Boolean(isTrending);
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);
    if (badge !== undefined) dataToUpdate.badge = badge;

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ message: 'Product updated successfully!', product: updated });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product removed successfully.' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};
