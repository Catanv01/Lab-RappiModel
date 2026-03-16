export interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  DECLINED = 'declined',
}

export interface CreateOrderDTO {
  consumerId: string;
  storeId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusDTO {
  id: string;
  status: OrderStatus;
  deliveryId?: string;
}