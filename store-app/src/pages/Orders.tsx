import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { supabase } from '../config/supabase';
import '../styles/orders.css';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeResponse = await api.get('/stores/my-store');
        const ordersResponse = await api.get(`/orders/store/${storeResponse.data.id}`);
        const ordersData = ordersResponse.data;

        const ordersWithItems = await Promise.all(
          ordersData.map(async (order: Order) => {
            const itemsResponse = await api.get(`/orders/${order.id}/items`);
            return { ...order, items: itemsResponse.data };
          })
        );

        setOrders(ordersWithItems);

        // Suscribirse a cada orden en tiempo real
        ordersData.forEach((order: Order) => {
          const channel = supabase.channel(`order:${order.id}`);

          channel.on('broadcast', { event: 'position-update' }, () => {
            // Actualizar status de la orden en tiempo real
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: 'En entrega' } : o
              )
            );
          });

          channel.on('broadcast', { event: 'order-delivered' }, () => {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: 'Entregado' } : o
              )
            );
          });

          channel.subscribe();
        });

      } catch {
        setError('Error fetching orders');
      }
    };
    fetchData();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const getStatusClass = (status: string) => {
    return `status-${status.replace(' ', '_')}`;
  };

  return (
    <div className="orders-container">
      <div className="orders-content">
        <div className="orders-header">
          <h1 className="orders-title">Orders</h1>
          <button className="orders-back" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {error && <p className="orders-error">{error}</p>}

        {orders.length === 0 && <p className="orders-empty">No orders yet</p>}

        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <p className="order-id">ID: {order.id}</p>
            <p className="order-status">
              Status:{' '}
              <span className={getStatusClass(order.status)}>
                {order.status}
              </span>
            </p>

            {order.items && order.items.length > 0 && (
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${item.subtotal}</span>
                  </div>
                ))}
                <div className="order-total">
                  <span>Total</span>
                  <span>${order.items.reduce((sum, item) => sum + item.subtotal, 0)}</span>
                </div>
              </div>
            )}

            <p className="order-date">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;