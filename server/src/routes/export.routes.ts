import { Router } from 'express';
import { exportCsv } from '../controllers/export.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.post('/', exportCsv); // POST /api/export

export default router;
