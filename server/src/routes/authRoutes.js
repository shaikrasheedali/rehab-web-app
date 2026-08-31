import { Router } from 'express';
import { login, getCurrentUser, logout, changePassword } from '../controllers/authController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdmin, getCurrentUser);
router.post('/logout', logout);
router.post('/change-password', requireAdmin, changePassword);

export default router;
