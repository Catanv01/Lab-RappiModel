export interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: OrderStatus;
  createdAt: string;
  delivery_position?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
}

export enum OrderStatus {
  CREATED = 'pending',
  IN_DELIVERY = 'in_progress',
  DELIVERED = 'delivered',
}

export interface CreateOrderDTO {
  consumerId: string;
  storeId: string;
  destination: {
    lat: number;
    lng: number;
  };
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

export interface UpdateOrderPositionDTO {
  id: string;
  lat: number;
  lng: number;
}