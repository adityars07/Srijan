import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      message: 'Welcome back!',
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
  } catch (err: any) {
    console.error('Auth login error:', err);
    res.status(500).json({ error: 'Login failed.' });
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
