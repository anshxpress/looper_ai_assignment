import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    const mapped = users.map(u => ({ ...u, id: u._id.toString() }));
    res.json({ success: true, data: mapped });
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, role, password } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({ email, name, role, passwordHash });
    
    const safeUser = user.toObject();
    delete (safeUser as any).passwordHash;
    (safeUser as any).id = safeUser._id.toString();

    res.status(201).json({ success: true, data: safeUser });
  } catch (err) { next(err); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { name, role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const safeUser = user.toObject();
    (safeUser as any).id = safeUser._id.toString();

    res.json({ success: true, data: safeUser });
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent deleting oneself
    if (id === (req as any).userId) {
      res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};
