import { Router } from 'express';
import {
  createOrderController,
  getAvailableOrdersController,
  getMyOrdersController,
  getStoreOrdersController,
  updateOrderStatusController,
  getOrderItemsController,
  getDeliveryOrdersController,
  getOrderByIdController,
  acceptOrderController,
  updateOrderPositionController,
} from './order.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.use(authMiddleware);
router.get('/my-orders', getMyOrdersController);
router.get('/available', getAvailableOrdersController);
router.get('/delivery-orders', getDeliveryOrdersController);
router.get('/store/:storeId', getStoreOrdersController);
router.get('/:id', getOrderByIdController);
router.post('/', createOrderController);
router.patch('/:id/accept', acceptOrderController);
router.patch('/:id/position', updateOrderPositionController);
router.patch('/:id/status', updateOrderStatusController);
router.get('/:id/items', getOrderItemsController);