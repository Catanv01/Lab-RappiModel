import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  createOrderService,
  getAvailableOrdersService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  updateOrderStatusService,
} from './order.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { OrderStatus } from './order.types';

export const getMyOrdersController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const orders = await getOrdersByConsumerService(user.id);
  return res.json(orders);
};

export const getStoreOrdersController = async (req: Request, res: Response) => {
  const storeId = String(req.params.storeId);
  const orders = await getOrdersByStoreService(storeId);
  return res.json(orders);
};

export const getAvailableOrdersController = async (req: Request, res: Response) => {
  const orders = await getAvailableOrdersService();
  return res.json(orders);
};

export const createOrderController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const user = getUserFromRequest(req);
  const { storeId, items } = req.body;

  if (storeId === undefined) throw Boom.badRequest('Store ID is required');
  if (!items || items.length === 0) throw Boom.badRequest('Items are required');

  const order = await createOrderService({
    consumerId: user.id,
    storeId,
    items,
  });

  return res.status(201).json(order);
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const user = getUserFromRequest(req);
  const id = String(req.params.id);
  const { status } = req.body;

  if (!Object.values(OrderStatus).includes(status)) {
    throw Boom.badRequest(`Status must be one of: ${Object.values(OrderStatus).join(', ')}`);
  }

  const order = await updateOrderStatusService({
    id,
    status,
    deliveryId: user.id,
  });

  return res.json(order);
};