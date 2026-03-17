import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/orders.css';

interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: string;
  createdAt: string;
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
        setOrders(ordersResponse.data);
      } catch {
        setError('Error fetching orders');
      }
    };
    fetchData();
  }, []);

  const getStatusClass = (status: string) => {
    return `status-${status}`;
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