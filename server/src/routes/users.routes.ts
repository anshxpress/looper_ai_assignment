import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin); // Only admins can manage users

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
