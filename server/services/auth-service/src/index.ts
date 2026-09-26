import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendOtpEmail } from './mailer.js';

// Initialize environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'srijan_artisan_secret_key_2026_super_secure_jwt';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ service: 'auth-service', status: 'healthy', port: PORT });
});

// Register
app.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'CUSTOMER',
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    res.status(201).json({ message: 'Account created successfully!', user, token });
  } catch (err: any) {
    console.error('Auth register error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Admin direct authentication
    if (user.role === 'ADMIN') {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      res.json({
        message: 'Welcome back, Master Artisan!',
        requiresOtp: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      });
      return;
    }

    // Customer OTP verification requirement
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Clean up previous unverified OTP sessions for this customer
    await prisma.otpVerification.deleteMany({
      where: { email: cleanEmail, purpose: 'CUSTOMER_LOGIN' },
    });

    const otpRecord = await prisma.otpVerification.create({
      data: {
        email: cleanEmail,
        otpHash,
        purpose: 'CUSTOMER_LOGIN',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes validity
      },
    });

    // Real email dispatch
    await sendOtpEmail(cleanEmail, user.name, otp);

    const maskedEmail = cleanEmail.replace(/^(.)(.*)(@.*)$/, (_: string, a: string, b: string, c: string) => a + '*'.repeat(Math.min(b.length, 5)) + c);
    const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    res.json({
      requiresOtp: true,
      verificationId: otpRecord.id,
      email: cleanEmail,
      maskedEmail,
      smtpConfigured: hasSmtp,
      ...(!hasSmtp && { devOtp: otp }),
      message: hasSmtp
        ? `A 6-digit verification code has been sent to ${maskedEmail}.`
        : `SMTP not configured in auth-service .env. Live email cannot be delivered to ${maskedEmail}.`,
    });
  } catch (err: any) {
    console.error('Auth login error:', err);
    res.status(500).json({ error: 'Login failed: ' + (err.message || 'Server error') });
  }
});

// Verify OTP
app.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, verificationId } = req.body;
    if (!email || !otp || !verificationId) {
      res.status(400).json({ error: 'Email, verification code, and session ID are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await prisma.otpVerification.findUnique({
      where: { id: verificationId },
    });

    if (!record || record.email !== cleanEmail || record.verified) {
      res.status(400).json({ error: 'Invalid or expired verification session. Please sign in again.' });
      return;
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    if (record.attempts >= 3) {
      res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new code.' });
      return;
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      const newAttempts = record.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: newAttempts },
      });
      const remaining = 3 - newAttempts;
      res.status(401).json({
        error: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Invalid verification code. Maximum attempts reached. Please request a new code.',
      });
      return;
    }

    // Mark OTP record as verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      message: 'Identity verified successfully! Welcome to Srijan.',
      user,
      token,
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// Resend OTP
app.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required to resend verification code.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      res.status(404).json({ error: 'Customer account not found.' });
      return;
    }

    // Rate-limiting check: enforce 60-second cooldown between dispatches
    const latest = await prisma.otpVerification.findFirst({
      where: { email: cleanEmail, purpose: 'CUSTOMER_LOGIN' },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      const elapsedMs = Date.now() - latest.createdAt.getTime();
      if (elapsedMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting a new code.` });
        return;
      }
    }

    // Generate fresh OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.otpVerification.deleteMany({
      where: { email: cleanEmail, purpose: 'CUSTOMER_LOGIN' },
    });

    const newRecord = await prisma.otpVerification.create({
      data: {
        email: cleanEmail,
        otpHash,
        purpose: 'CUSTOMER_LOGIN',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendOtpEmail(cleanEmail, user.name, otp);
    const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

    res.json({
      message: hasSmtp
        ? `A fresh verification code has been sent to your email.`
        : `SMTP not configured in auth-service .env. Live email cannot be delivered.`,
      verificationId: newRecord.id,
      smtpConfigured: hasSmtp,
      ...(!hasSmtp && { devOtp: otp }),
    });
  } catch (err: any) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// Get Current User Profile (Token decoded from Authorization header or X-User-Payload)
app.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    let userId: string | undefined;

    const userHeader = req.headers['x-user-payload'] as string;
    if (userHeader) {
      try {
        userId = JSON.parse(userHeader).id;
      } catch {
        // fallback to bearer
      }
    }

    if (!userId) {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET) as any;
        userId = decoded.id;
      }
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        addresses: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    console.error('Auth getMe error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// List Users (Admin internal)
app.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ total: users.length, users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 [Auth Service] running on http://localhost:${PORT}`);
});
