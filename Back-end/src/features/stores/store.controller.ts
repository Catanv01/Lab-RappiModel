import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  getStoreByUserIdService,
  getStoresService,
  updateStoreService,
} from './store.service';
import { getUserFromRequest } from '../../middlewares/authMiddleware';

export const getStoresController = async (req: Request, res: Response) => {
  const stores = await getStoresService();
  return res.json(stores);
};

export const getMyStoreController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const store = await getStoreByUserIdService(user.id);
  return res.json(store);
};

export const updateStoreController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const id = String(req.params.id);
  const { isOpen } = req.body;

  if (isOpen === undefined) {
    throw Boom.badRequest('isOpen is required');
  }

  const store = await updateStoreService({ id, isOpen });
  return res.json(store);
};