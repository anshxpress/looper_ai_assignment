import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import type { SafeUser } from '../types';

// ── Zod Schemas (Fix 3) ───────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// ── Helper: convert Mongoose doc → SafeUser (Fix 4) ──────────────────────────
function toSafeUser(doc: Awaited<ReturnType<typeof User.prototype.toObject>>): SafeUser {
  const obj = doc as Record<string, unknown>;
  return {
    id: String(obj._id),
    _id: obj._id,
    email: obj.email as string,
    name: obj.name as string,
    role: obj.role as 'admin' | 'viewer',
    createdAt: obj.createdAt as Date | undefined,
    updatedAt: obj.updatedAt as Date | undefined,
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      tokens: { accessToken: token },
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) { next(err); }
};

export const logout = (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Logged out' });
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fix 7: req.userId is typed globally — no cast needed
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: toSafeUser(user.toObject()) });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const { name, email } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.userId } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.userId, { name, email: email.toLowerCase() }, { new: true }).select('-passwordHash');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    res.json({ success: true, data: toSafeUser(user.toObject()) });
  } catch (err) { next(err); }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const { currentPassword, newPassword } = parsed.data;

    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
