import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ service: 'commission-service', status: 'healthy', port: PORT });
});

// ================= CUSTOM COMMISSIONS ROUTER =================
const customRouter = Router();

// POST /custom-requests or / - Submit bespoke request
customRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, category, occasion, budgetRange, description, referenceImages } =
      req.body;

    if (!name || !email || !category || !description) {
      res.status(400).json({ error: 'Name, email, category, and description are required.' });
      return;
    }

    const customRequest = await prisma.customCommission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        category,
        occasion: occasion || null,
        budgetRange: budgetRange || null,
        description: description.trim(),
        referenceImages: Array.isArray(referenceImages)
          ? JSON.stringify(referenceImages)
          : referenceImages || null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Your custom artisan request has been received! Rakhi will connect with you within 24 hours.',
      customRequest,
    });
  } catch (err: any) {
    console.error('Create custom request error:', err);
    res.status(500).json({ error: 'Failed to submit custom commission request.' });
  }
});

// GET /custom-requests or / - List all requests (Admin)
customRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { category: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const take = parseInt(limit as string, 10) || 50;
    const skip = ((parseInt(page as string, 10) || 1) - 1) * take;

    const [total, requests] = await Promise.all([
      prisma.customCommission.count({ where }),
      prisma.customCommission.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Parse reference images for frontend if stored as JSON
    const formattedRequests = requests.map((r) => {
      let parsedImages = [];
      try {
        parsedImages = r.referenceImages ? JSON.parse(r.referenceImages) : [];
      } catch {
        parsedImages = r.referenceImages ? [r.referenceImages] : [];
      }
      return { ...r, referenceImages: parsedImages };
    });

    res.json({ total, requests: formattedRequests });
  } catch (err: any) {
    console.error('Get custom requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve custom requests.' });
  }
});

// PATCH /custom-requests/:id or /:id - Update commission status / quote (Admin)
customRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, quoteAmountINR, quoteAmountUSD, adminNotes } = req.body;

    const updated = await prisma.customCommission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(quoteAmountINR !== undefined && { quoteAmountINR: Number(quoteAmountINR) }),
        ...(quoteAmountUSD !== undefined && { quoteAmountUSD: Number(quoteAmountUSD) }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    res.json({ message: 'Custom commission updated successfully!', customRequest: updated });
  } catch (err: any) {
    console.error('Update custom request error:', err);
    res.status(500).json({ error: 'Failed to update custom commission.' });
  }
});

// ================= CONTACT INQUIRIES ROUTER =================
const contactRouter = Router();

// POST /contact or / - Submit contact form
contactRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
      },
    });

    res.status(201).json({
      message: 'Thank you for reaching out! We will respond to your inquiry shortly.',
      contact,
    });
  } catch (err: any) {
    console.error('Create contact message error:', err);
    res.status(500).json({ error: 'Failed to submit contact message.' });
  }
});

// GET /contact or / - List messages (Admin)
contactRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ messages });
  } catch (err: any) {
    console.error('Get contact messages error:', err);
    res.status(500).json({ error: 'Failed to retrieve contact messages.' });
  }
});

// PATCH /contact/:id/read or /:id/read - Mark message read (Admin)
contactRouter.patch('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ message: 'Message marked as read.', contact: updated });
  } catch (err: any) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to update message.' });
  }
});

// GET /metrics - Commission & inquiry metrics
app.get('/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalCommissions, pendingCommissions, totalMessages, unreadMessages, recentRequests] =
      await Promise.all([
        prisma.customCommission.count(),
        prisma.customCommission.count({ where: { status: 'PENDING' } }),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.customCommission.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    res.json({
      totalCommissions,
      pendingCommissions,
      totalMessages,
      unreadMessages,
      recentRequests,
    });
  } catch (err: any) {
    console.error('Commission metrics error:', err);
    res.status(500).json({ error: 'Failed to retrieve commission metrics.' });
  }
});

// Mount routers to support both direct and gateway proxied routes
app.use('/custom-requests', customRouter);
app.use('/contact', contactRouter);
app.use('/', customRouter);

app.listen(PORT, () => {
  console.log(`🎨 Commission & Contact Service running on port ${PORT}`);
});
