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
    (req as Request & { userId?: string; userRole?: string }).userId = payload.sub;
    (req as Request & { userId?: string; userRole?: string }).userRole = payload.role;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** Only admin role can access the wrapped route */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as Request & { userRole?: string }).userRole !== 'admin') {
    res.status(403).json({ success: false, message: 'Forbidden: admin only' });
    return;
  }
  next();
};
