import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
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
      message: 'Message sent successfully! Rakhi will get back to you soon.',
      contact,
    });
  } catch (err: any) {
    console.error('Error submitting contact message:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const getContactMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ messages });
  } catch (err: any) {
    console.error('Error fetching contact messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ message: 'Marked as read', contact: updated });
  } catch (err: any) {
    console.error('Error marking message read:', err);
    res.status(500).json({ error: 'Failed to update message status.' });
  }
};
