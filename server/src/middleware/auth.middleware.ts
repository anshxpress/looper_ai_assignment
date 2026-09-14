import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload { sub: string; role: string; }

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'changeme') as JwtPayload;
    req.userId   = payload.sub;   // typed via global Express augmentation
    req.userRole = payload.role;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** Only admin role can access the wrapped route */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ success: false, message: 'Forbidden: admin only' });
    return;
  }
  next();
};
