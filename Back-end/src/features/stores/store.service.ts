import { CreateStoreDTO, Store, UpdateStoreDTO } from './store.types';
import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export const getStoresService = async (): Promise<Store[]> => {
  const dbRequest = await pool.query(
    'SELECT id, name, "isOpen", "userId" FROM stores'
  );
  return dbRequest.rows;
};

export const getStoreByUserIdService = async (userId: string): Promise<Store> => {
  const dbRequest = await pool.query(
    'SELECT id, name, "isOpen", "userId" FROM stores WHERE "userId" = $1',
    [userId]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('Store not found');
  }

  return dbRequest.rows[0];
};

export const createStoreService = async (store: CreateStoreDTO): Promise<Store> => {
  const dbRequest = await pool.query(
    'INSERT INTO stores (name, "userId") VALUES ($1, $2) RETURNING *',
    [store.name, store.userId]
  );
  return dbRequest.rows[0];
};

export const updateStoreService = async (store: UpdateStoreDTO): Promise<Store> => {
  const dbRequest = await pool.query(
    'UPDATE stores SET "isOpen" = $1 WHERE id = $2 RETURNING *',
    [store.isOpen, store.id]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('Store not found');
  }

  return dbRequest.rows[0];
};