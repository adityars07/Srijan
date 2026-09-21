import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'srijan_artisan_secret_key_2026_super_secure_jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const verifyAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Check Authorization header or gateway forwarded header
  const authHeader = req.headers.authorization;
  const userHeader = req.headers['x-user-payload'] as string;

  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
      return next();
    } catch {
      // fallback to token check
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const userHeader = req.headers['x-user-payload'] as string;
  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
      return next();
    } catch {
      // ignore
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // ignore for optional
    }
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Artisan Admin privileges required.' });
    return;
  }
  next();
};
