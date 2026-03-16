import { Router } from 'express';
import {
  getStoresController,
  getMyStoreController,
  updateStoreController,
} from './store.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.use(authMiddleware);
router.get('/', getStoresController);        
router.get('/my-store', getMyStoreController); 
router.patch('/:id', updateStoreController);   