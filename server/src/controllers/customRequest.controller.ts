import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const createCustomRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, category, occasion, budgetRange, description, referenceImages } = req.body;

    if (!name || !email || !category || !description) {
      res.status(400).json({ error: 'Name, email, category, and description are required.' });
      return;
    }

    const customRequest = await prisma.customCommission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        category,
        occasion: occasion || null,
        budgetRange: budgetRange || null,
        description,
        referenceImages: referenceImages ? JSON.stringify(referenceImages) : null,
        status: 'INQUIRY_RECEIVED',
      },
    });

    res.status(201).json({
      message: 'Your custom creation request has been received! Rakhi will review and get in touch within 24 hours.',
      customRequest,
    });
  } catch (err: any) {
    console.error('Error creating custom request:', err);
    res.status(500).json({ error: 'Failed to submit custom creation request.' });
  }
};

export const getAllCustomRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.customCommission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      total: requests.length,
      requests: requests.map((r) => ({
        ...r,
        referenceImages: r.referenceImages ? JSON.parse(r.referenceImages) : [],
      })),
    });
  } catch (err: any) {
    console.error('Error fetching custom requests:', err);
    res.status(500).json({ error: 'Failed to fetch custom requests.' });
  }
};

export const updateCustomRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, quoteAmountINR, quoteAmountUSD, adminNotes } = req.body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (quoteAmountINR !== undefined) data.quoteAmountINR = parseFloat(quoteAmountINR);
    if (quoteAmountUSD !== undefined) data.quoteAmountUSD = parseFloat(quoteAmountUSD);
    if (adminNotes !== undefined) data.adminNotes = adminNotes;

    const updated = await prisma.customCommission.update({
      where: { id },
      data,
    });

    res.json({
      message: 'Custom request updated successfully!',
      customRequest: updated,
    });
  } catch (err: any) {
    console.error('Error updating custom request:', err);
    res.status(500).json({ error: 'Failed to update custom request.' });
  }
};
