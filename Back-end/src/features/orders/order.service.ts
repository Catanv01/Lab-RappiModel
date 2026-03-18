import { CreateOrderDTO, Order, UpdateOrderStatusDTO } from './order.types';
import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export const getOrdersByConsumerService = async (consumerId: string): Promise<Order[]> => {
  const dbRequest = await pool.query(
    'SELECT * FROM orders WHERE "consumerId" = $1 ORDER BY "createdAt" DESC',
    [consumerId]
  );
  return dbRequest.rows;
};

export const getOrdersByStoreService = async (storeId: string): Promise<Order[]> => {
  const dbRequest = await pool.query(
    'SELECT * FROM orders WHERE "storeId" = $1 ORDER BY "createdAt" DESC',
    [storeId]
  );
  return dbRequest.rows;
};

export const getAvailableOrdersService = async (): Promise<Order[]> => {
  const dbRequest = await pool.query(
    'SELECT * FROM orders WHERE status = $1 ORDER BY "createdAt" DESC',
    ['pending']
  );
  return dbRequest.rows;
};

export const createOrderService = async (order: CreateOrderDTO): Promise<Order> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderRequest = await client.query(
      'INSERT INTO orders ("consumerId", "storeId") VALUES ($1, $2) RETURNING *',
      [order.consumerId, order.storeId]
    );

    const newOrder = orderRequest.rows[0];

    for (const item of order.items) {
      await client.query(
        'INSERT INTO order_items ("orderId", "productId", quantity) VALUES ($1, $2, $3)',
        [newOrder.id, item.productId, item.quantity]
      );
    }

    await client.query('COMMIT');
    return newOrder;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateOrderStatusService = async (data: UpdateOrderStatusDTO): Promise<Order> => {
  const dbRequest = await pool.query(
    'UPDATE orders SET status = $1, "deliveryId" = $2 WHERE id = $3 RETURNING *',
    [data.status, data.deliveryId ?? null, data.id]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('Order not found');
  }

  return dbRequest.rows[0];
};

export const getOrderItemsService = async (orderId: string): Promise<any[]> => {
  const dbRequest = await pool.query(
    `SELECT oi.id, oi.quantity, p.name, p.price, (oi.quantity * p.price) as subtotal
     FROM order_items oi
     JOIN products p ON oi."productId" = p.id
     WHERE oi."orderId" = $1`,
    [orderId]
  );
  return dbRequest.rows;
};

export const getOrdersByDeliveryService = async (deliveryId: string): Promise<Order[]> => {
  const dbRequest = await pool.query(
    'SELECT * FROM orders WHERE "deliveryId" = $1 AND status = $2 ORDER BY "createdAt" DESC',
    [deliveryId, 'accepted']
  );
  return dbRequest.rows;
};