import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
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
  // Stateless JWT — client discards token. Extend with a deny-list here if needed.
  res.json({ success: true, message: 'Logged out' });
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.userId is set by auth middleware
    const user = await User.findById((req as Request & { userId?: string }).userId).select('-passwordHash');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    
    const safeUser = user.toObject();
    (safeUser as any).id = safeUser._id.toString();

    res.json({ success: true, data: safeUser });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { name, email } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true }).select('-passwordHash');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    
    const safeUser = user.toObject();
    (safeUser as any).id = safeUser._id.toString();

    res.json({ success: true, data: safeUser });
  } catch (err) { next(err); }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
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
