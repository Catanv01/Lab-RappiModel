import { CreateProductDTO, Product } from './product.types';
import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export const getProductsByStoreService = async (storeId: string): Promise<Product[]> => {
  const dbRequest = await pool.query(
    'SELECT id, name, price, "storeId" FROM products WHERE "storeId" = $1',
    [storeId]
  );
  return dbRequest.rows;
};

export const createProductService = async (product: CreateProductDTO): Promise<Product> => {
  const dbRequest = await pool.query(
    'INSERT INTO products (name, price, "storeId") VALUES ($1, $2, $3) RETURNING *',
    [product.name, product.price, product.storeId]
  );
  return dbRequest.rows[0];
};

export const deleteProductService = async (productId: string): Promise<void> => {
  const dbRequest = await pool.query(
    'DELETE FROM products WHERE id = $1',
    [productId]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('Product not found');
  }
};