import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api'
import '../styles/MyOrders.css';

interface Order {
  id: string;
  consumerId: string;
  storeId: string;
  deliveryId: string | null;
  status: string;
  createdAt: string;
}

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/delivery-orders');
        setOrders(response.data);
      } catch {
        setError('Error fetching orders');
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  return (
    <div className="orders-container">
      <div className="orders-content">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <button className="orders-back" onClick={() => navigate('/available-orders')}>
            Back
          </button>
        </div>

        {error && <p className="orders-error">{error}</p>}

        {orders.length === 0 && <p className="orders-empty">No accepted orders yet</p>}

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

export default MyOrders;