import { Router } from 'express';
import { getAll, getSummary, getAnalytics } from '../controllers/transactions.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware); // All transaction routes require auth

router.get('/',        getAll);
router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);

export default router;
