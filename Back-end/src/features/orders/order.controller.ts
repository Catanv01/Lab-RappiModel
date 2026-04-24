import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  createOrderService,
  getAvailableOrdersService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  updateOrderStatusService,
  getOrderItemsService,
  getOrdersByDeliveryService,
  getOrderByIdService,
  acceptOrderService,
  updateOrderPositionService,
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

export const getDeliveryOrdersController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const orders = await getOrdersByDeliveryService(user.id);
  return res.json(orders);
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const order = await getOrderByIdService(id);
  return res.json(order);
};

export const createOrderController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const user = getUserFromRequest(req);
  const { storeId, items, destination } = req.body;

  if (storeId === undefined) throw Boom.badRequest('Store ID is required');
  if (!items || items.length === 0) throw Boom.badRequest('Items are required');
  if (!destination || destination.lat === undefined || destination.lng === undefined) {
    throw Boom.badRequest('Destination coordinates are required');
  }

  const order = await createOrderService({
    consumerId: user.id,
    storeId,
    items,
    destination,
  });

  return res.status(201).json(order);
};

export const acceptOrderController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const id = String(req.params.id);
  const order = await acceptOrderService(id, user.id);
  return res.json(order);
};

export const updateOrderPositionController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const id = String(req.params.id);
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    throw Boom.badRequest('lat and lng are required');
  }

  const order = await updateOrderPositionService({ id, lat, lng });
  return res.json(order);
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

export const getOrderItemsController = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const items = await getOrderItemsService(id);
  return res.json(items);
};