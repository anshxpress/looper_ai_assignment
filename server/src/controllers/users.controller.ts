import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import type { SafeUser } from '../types';

// ── Zod Schemas (Fix 3) ───────────────────────────────────────────────────────
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['admin', 'viewer']).default('viewer'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  role: z.enum(['admin', 'viewer']).optional(),
});

// ── Helper: convert Mongoose doc → SafeUser (Fix 4) ──────────────────────────
function toSafeUser(doc: Record<string, unknown>): SafeUser {
  return {
    id: String(doc._id),
    _id: doc._id,
    email: doc.email as string,
    name: doc.name as string,
    role: doc.role as 'admin' | 'viewer',
    createdAt: doc.createdAt as Date | undefined,
    updatedAt: doc.updatedAt as Date | undefined,
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: users.map(u => toSafeUser(u as Record<string, unknown>)) });
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const { email, name, role, password } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password ?? 'password123', 10);
    const user = await User.create({ email: email.toLowerCase(), name, role, passwordHash });

    res.status(201).json({ success: true, data: toSafeUser(user.toObject() as unknown as Record<string, unknown>) });
  } catch (err) { next(err); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: toSafeUser(user.toObject() as unknown as Record<string, unknown>) });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fix 7: req.userId is typed globally — no cast needed
    if (req.params.id === req.userId) {
      res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};
