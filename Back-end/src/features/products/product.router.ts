import { Router } from 'express';
import {
  createProductController,
  deleteProductController,
  getProductsByStoreController,
} from './product.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.use(authMiddleware);
router.get('/:storeId', getProductsByStoreController);
router.post('/', createProductController);               
router.delete('/:id', deleteProductController);         