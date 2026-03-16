import { Request, Response } from 'express';
import Boom from '@hapi/boom';
import {
  createProductService,
  deleteProductService,
  getProductsByStoreService,
} from './product.service';

export const getProductsByStoreController = async (req: Request, res: Response) => {
  const storeId = String(req.params.storeId);
  const products = await getProductsByStoreService(storeId);
  return res.json(products);
};

export const createProductController = async (req: Request, res: Response) => {
  if (!req.body) {
    throw Boom.badRequest('Request body is required');
  }

  const { name, price, storeId } = req.body;

  if (name === undefined) throw Boom.badRequest('Name is required');
  if (price === undefined) throw Boom.badRequest('Price is required');
  if (storeId === undefined) throw Boom.badRequest('Store ID is required');

  const product = await createProductService({ name, price, storeId });
  return res.status(201).json(product);
};

export const deleteProductController = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await deleteProductService(id);
  return res.json({ message: 'Product deleted' });
};