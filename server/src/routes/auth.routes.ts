import { Router } from 'express';
import { login, logout, me, updateProfile, updatePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login',  login);
router.post('/logout', logout);
router.get('/me',      authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password',authMiddleware, updatePassword);

export default router;
