import { Router } from 'express';
import {
  authenticateUserController,
  createUserController,
  getMeController,
} from './auth.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.post('/login', authenticateUserController);
router.post('/register', createUserController);
router.get('/me', authMiddleware, getMeController);